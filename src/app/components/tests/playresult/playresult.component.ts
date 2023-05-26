import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { IWatcherDescribe, StatesTester, WsWatcherService, WsWatcherTester } from 'src/app/services/ws-watcher.service';
import { get } from 'lodash';
import { WsTestLogstashService } from 'src/app/services/ws-test-logstash.service';
import { TestType, History } from 'src/app/models/IWsTestLogstashService';

enum wsState {
  gameSleep= 'sleep: 天黑請閉眼',
  gameKill= 'kill: 狼人請殺人',
  gameWakeup= 'wakeup: 天亮請睜眼',
  gameVote = 'vote: 開始投票'
}
enum wsEvent {
  SLEEP = 'sleep',
  KILL = 'kill',
  WAKEUP = 'wakeup',
  VOTE = 'vote'
}

interface GameMMachineContext {
  data: number;
}


@Component({
  selector: 'app-playresult',
  templateUrl: './playresult.component.html',
  styleUrls: ['./playresult.component.sass']
})
export class PlayresultComponent implements OnInit {
  @Input() selectedIndex: number = 0;
  @Output() history = new EventEmitter();
  list: IWatcherDescribe[] = []
  processError = '';
  dataError = '';
  mockDataError = false;
  constructor(
    private watcher: WsWatcherService,
    private logstashService: WsTestLogstashService) {
  }

  changeData() {
    this.mockDataError = !this.mockDataError;
  }

  getStatesTotalErrorCount(states: StatesTester[]) {
    return states.map(item=> item.errors.length).reduce((a,b)=>a+b)
  }

  ngOnInit(): void {
    setTimeout(()=> {
      this.createPlayResultMachine();
    }, 1000);
    this.logstashService.onLogUpdate.subscribe(datas=> {
      const dataErrorCount = datas.filter(data=> !data.isRead && data.type === TestType.DATA).length
      const processErrorCount = datas.filter(data=> !data.isRead && data.type === TestType.PROCESS).length
      if(dataErrorCount === 0 && processErrorCount === 0){
        this.clearAllError();
      }
    })
  }

  goHistory(state: StatesTester) {
    this.history.emit()
    state.clear()
  }
  change() {
    this.watcher.changeState(wsEvent.SLEEP);
  }

  createPlayResultMachine() {
    const history: History[] = [];
    const initialState = wsState.gameSleep;

    const {service:promiseService, expectTester, statesTester: states, info:promiseServiceInfo} = this.watcher.createTester(this.watcher.createMachine({
      id: '狼人殺',
      initial: initialState,
      predictableActionArguments: true,
      context: {
        data: 0,
      },
      states: {
        [wsState.gameSleep]: {
          entry: 'updateCurrentData',
          on: {
            [wsEvent.KILL]:{ target: wsState.gameKill }
          }
        },
        [wsState.gameKill]: {
          entry: 'updateCurrentData',
          on: {
            [wsEvent.WAKEUP]:{ target: wsState.gameWakeup },
          }
        },
        [wsState.gameWakeup]: {
          entry: 'updateCurrentData',
          on: {
            [wsEvent.VOTE]:{ target: wsState.gameVote },
          }
        },
        [wsState.gameVote]: {
          entry: 'updateCurrentData',
          on: {
            [wsEvent.SLEEP]:{ target: wsState.gameSleep },
          }
        }
      }
    },
    {
      actions: {
        updateCurrentData: (context, event: any) => {
         
          if(this.mockDataError) {
            expectTester.expect(context.data, this.getState(event.type)).toBe(9999, `推播的資料錯誤, 應該為9999, 實際上為 ${context.data}`, history.slice(-10));
          }
        },
      }
    }
    ));
    this.watcher.changeState(wsEvent.SLEEP);
    [wsEvent.SLEEP, wsEvent.KILL, wsEvent.WAKEUP, wsEvent.VOTE].forEach(event=> {
      const sleepSb = this.watcher.getGusherMessage(event)
      sleepSb.subscribe(res=> {
         history.push({
          date: new Date().toISOString(),
          event: `進入${event} (WS):`,
          msg: JSON.stringify(res)
         });
         this.watcher.sendMachineEvent<GameMMachineContext>(
          promiseService,
          { type: event, value: res},
          (cuurentState)=>{
            console.log(cuurentState)
            expectTester.logFailed(`在 [${cuurentState.value}] 下, 收到${event}事件`, history.slice(-10))
          });
         
      })
    })
    
    


    // 开启 service
    promiseService.start();
    this.list.push({
      describeTitle: '狼人殺遊戲',
      list: [
        {
          caseTitle: promiseService.id,
          tester: {
            promiseService,
            states,
            expectTester,
            history
          }
        }
      ]
    })
   }


  clearAllError() {
    this.list.forEach(describeItem => {
      describeItem.list.forEach((testItem)=> {
        testItem.tester.expectTester.error = '';
        testItem.tester.states.forEach((state: StatesTester ) => {
          state.clear();
        })
      })
    })
  }

  getState(state: string): wsState {

    if(state === 'xstate.init' || state === 'sleep'){
      return wsState.gameSleep
    }

    if(state === 'vote'){
      return wsState.gameVote
    }
    if(state === 'wakeup'){
      return wsState.gameWakeup
    }

    return wsState.gameKill
  }

}

