import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { GusherService } from '../../services/gusher.service';
import { WsTestLogstashService } from 'src/app/services/ws-test-logstash.service';
import { TestType } from 'src/app/models/IWsTestLogstashService';
import { bufferTime, filter, Subject, Subscription } from 'rxjs';
import { HttpService } from 'src/app/services/http.service';


export enum GusehrState {
  NONE,
  CONNECTED,
  COLSED,
  UNKNOWN
}

const  msgMappingbg = {
  [GusehrState.NONE]: 'waiting',
  [GusehrState.CONNECTED]: 'connect',
  [GusehrState.COLSED]: 'close',
  [GusehrState.UNKNOWN]: 'unknown'
}

const  msgMapping = {
  [GusehrState.NONE]: '等待連線',
  [GusehrState.CONNECTED]: '連線成功',
  [GusehrState.COLSED]: '關閉連線',
  [GusehrState.UNKNOWN]: '未知的狀態'
}

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.sass']
})
export class StateComponent implements OnInit, OnDestroy {

  gusehrState = GusehrState.NONE
  msg: string = msgMapping[GusehrState.NONE];
  msgbg: string = msgMappingbg[GusehrState.NONE];
  state = GusehrState;
  dataErrorCount = 0;
  processErrorCount = 0;
  private _gusherService = inject(GusherService)
  private sendErrorMSg = new Subject<boolean>();
  private subList: Subscription[] = [];

  constructor(
    private logstashService: WsTestLogstashService,
    private http: HttpService
    ) {}

  ngOnDestroy(): void {
    this.subList.forEach(sub => sub.unsubscribe())
  }

  ngOnInit(): void {
    this.bindEvent();
  }

  private bindEvent() {
    this.subList[0] = this._gusherService.onGusherStatusChanged.subscribe({
      next: status => {
        console.log(status)
        switch (status) {
          case 'connected':
            this.setState(GusehrState.CONNECTED)
            break;
          case 'closed':
              this.setState(GusehrState.COLSED)
              break;
          default:
            console.log('未知的狀態', status)
            this.setState(GusehrState.UNKNOWN)
            break;
        }
      }
    });
    this.subList[1] = this.logstashService.onLogUpdate.subscribe(datas=> {
      const dataErrorCount = datas.filter(data=> !data.isRead && data.type === TestType.DATA).length
      const processErrorCount = datas.filter(data=> !data.isRead && data.type === TestType.PROCESS).length

      if((dataErrorCount+processErrorCount) > 0  ) {
        this.sendErrorMSg.next(false);
      }
      // console.log(dataErrorCount, processErrorCount, datas)
      this.dataErrorCount = dataErrorCount;
      this.processErrorCount = processErrorCount;
    })
    this.subList[2] = this.sendErrorMSg.pipe(
      bufferTime(10 * 1000),
      filter(res=> res.length > 0)
      ).subscribe((res)=>{
        this.sendError();
      })
  }

  private sendError() {
    return;
    
    // 語音
    this.http.post({ type: 'POST', url: '/msg' }, { msg: '監控到錯誤, 請查看系統' }).subscribe({
      error: (err) => {
        console.log(err);
      }
    });

    // TG通知
    const TOKEN=""
    const ID=""
    const TG_URL=`/tg/bot${TOKEN}/sendMessage`
    this.logstashService.getAllHistroyLog(1).subscribe(res=> {
      const err = res[0]
      if(err) {
        this.http.post({ type: 'POST', url: TG_URL }, { chat_id:ID, parse_mode: "HTML", text: `監控Gusher到錯誤, 請查看系統: [${err.id}]\n${err.msg}` }).subscribe({
          error: (err) => {
            console.log(err);
          }
        });
      }
    });
    
  }

  private setState(state: GusehrState) {
    this.gusehrState = state
    this.msg =  msgMapping[state];
    this.msgbg =  msgMappingbg[state];
  }
}
