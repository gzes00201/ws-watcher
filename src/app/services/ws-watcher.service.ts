import { Injectable } from '@angular/core';
import { GusherService } from './gusher.service';
import { Observable, Subject } from 'rxjs';
import { Channel } from '@xpomelox/gusher';
import { AnyEventObject, AreAllImplementationsAssumedToBeProvided, BaseActionObject, DefaultContext, EventObject, Interpreter, InterpreterOptions, ResolveTypegenMeta, ServiceMap, State, StateMachine, StateSchema, StateValue, TypegenConstraint, TypegenDisabled, Typestate, createMachine, interpret } from 'xstate';
import { WsTestLogstashService } from './ws-test-logstash.service';
import { TestLogData, TestType , History} from '../models/IWsTestLogstashService';
type IExpectCallback = <T>(res: T) => void;
type ITestCaseCallback = ((tester: IWatcherTester) => void);
type WsMachineCreateMachine = typeof createMachine
type WsMachineInterpret = typeof interpret

class WatcherExpect<T> {
  constructor(
    private data: T,
    private state:  StatesTester,
    private id: string,
    private logstashService: WsTestLogstashService) {
    if(!state){
      throw Error('state is not defind');
    }
  }

  toBe(toBeData: T, failedMessage?: string, history: History[] = []) {
    if(this.data !== toBeData) {
      this.setError(failedMessage || '', history);
    }
  }

  private setError(msg: string, history: History[] = []){
    this.state.setError(msg);
    this.logstashService.push(new TestLogData({
      timestamp: new Date().getTime(),
      type: TestType.DATA,
      id: this.id,
      isRead: false,
      msg: `資料錯誤： ${msg}`,
      history
    }))
  }

  clear() {
    this.state.clear();
  }
}

export class WsWatcherTester{
  error: string = '';

  constructor(public id: string, private statesTester: StatesTester[], private logstashService: WsTestLogstashService) {

  }

  // 流程性錯誤
  logFailed(msg: string, history: History[] = []) {
    this.error = msg
    this.logstashService.push(new TestLogData({
      timestamp: new Date().getTime(),
      type: TestType.PROCESS,
      id: this.id,
      isRead: false,
      msg: `流程錯誤： ${msg}`,
      history
    }))
  }


  expect<T, TStateSchema>(dats: T, state:  TStateSchema) {
    const stateData = this.statesTester.find(stateItem => stateItem.state === state)
    return new WatcherExpect(dats, stateData!, this.id, this.logstashService)
  }
}

export class StatesTester {
  private _errors: string[] =[];
  get errors(): string[] {
    return this._errors
  }

  constructor(public state: string){

  }

  setError(msg: string){
    this._errors.push(msg);
  }

  clear() {
    this._errors = [];
  }

}
interface WsTesterInfo {
  currentState: StateValue
}
export interface WsTester<
  TContext = DefaultContext,
  TStateSchema extends StateSchema<any> = any,
  TEvent extends EventObject = EventObject,
  TTypestate extends Typestate<TContext> = {
    value: any;
    context: TContext;
  },
  TResolvedTypesMeta = TypegenDisabled> {
  service: Interpreter<TContext, TStateSchema, TEvent, TTypestate, TResolvedTypesMeta>
  expectTester: WsWatcherTester
  statesTester: StatesTester[]
  info: WsTesterInfo
}

export interface WatcherCase {
  caseTitle: string;
  tester: any
}
export interface IWatcherTester {
  on<T>(event: Observable<T>, expect?: IExpectCallback): IWatcherTester;
  thenWait<T>(event: Observable<T>, expect?: IExpectCallback, failedMessage?: string): IWatcherTester;
}
export interface IWatcherDescribe {
  describeTitle: string;
  list: WatcherCase[];
}

export interface ITestOptions {
  beforeEach(): Promise<void>
}

export interface ITestCase {
  it(expectation: string, assertion: ITestCaseCallback, timeout?: number | undefined): ITestCase
  // on(channel: string, eventName: string): ITestCase;
  start(): IWatcherDescribe;
}

class TestCase implements ITestCase {
  private describe: IWatcherDescribe = {
    describeTitle: '',
    list: []
  };
  constructor(private title: string) {
    this.describe.describeTitle = title;
  }
  start(): IWatcherDescribe {
    return this.describe
  }
  it(expectation: string, assertion: ITestCaseCallback, timeout?: number | undefined): ITestCase {
    this.describe.list.push({
      caseTitle: expectation,
      tester: {}
    })
    return this
  }
}

type GameType = string
type GameTypeEvent = string
@Injectable({
  providedIn: 'root'
})
export class WsWatcherService {
  private channels: Map<GameType, Channel> = new Map();
  private channelSubs: Map<GameTypeEvent, Subject<any>> = new Map();

  constructor(private gusher: GusherService, private logstashService: WsTestLogstashService) { }

  describe(title: string, options: ITestOptions): ITestCase {

    const test: ITestCase = new TestCase(title)
    options.beforeEach()
    return test
  }

  getGusherMessage( event: string): Observable<any> {
    return this.getChannelSubs(event)
  }

  changeState(state: string) {
    this.gusher.gusher?.send('change', state);
  }

  private getChannelSubs(event: string): Subject<any> {
    const sub = new Subject();

    this.gusher.gusher?.bind(event, (res: any)=> {
      sub.next(res)
    })

    return sub
  }


  createMachine: WsMachineCreateMachine = (...option) => {
    return createMachine(...option)
  }

  interpret: WsMachineInterpret = (...option) => {
    return interpret(...option)
  }


  createTester<
    TContext = DefaultContext,
    TStateSchema extends StateSchema<any> = any,
    TEvent extends EventObject = EventObject,
    TTypestate extends Typestate<TContext> = {
      value: any;
      context: TContext;
    },
    TResolvedTypesMeta = TypegenDisabled>(
    machine: AreAllImplementationsAssumedToBeProvided<TResolvedTypesMeta> extends true ? StateMachine<TContext, TStateSchema, TEvent, TTypestate, any, any, TResolvedTypesMeta> : 'Some implementations missing',
    options?: InterpreterOptions): WsTester<
    TContext,
    TStateSchema,
    TEvent,
    TTypestate,
    TResolvedTypesMeta > {
      const service = interpret(machine as any, options) as any
      const states = Object.keys(service.machine.states)
      const statesTester =  states.map(state=> new StatesTester(state))
      const expectTester = new WsWatcherTester(service.id, statesTester, this.logstashService)
      const info: WsTesterInfo = {
        currentState : states.length > 0 ? states[0] : ''
      }
      service.onChange(()=>{
        expectTester.error = ''
        // statesTester.forEach(state=>{
        //   // state.clear();
        // })
      })
      service.onTransition((e: any)=>{
        if(e.changed) {
          info.currentState = e.value
        }
      })
      return {
        service,
        expectTester ,
        statesTester,
        info
      }
  }


  sendMachineEvent<T>(promiseService: any, event: BaseActionObject, failedCallBack?: (snapshotState: State<T, AnyEventObject, any, {
    value: any;
    context: T;
  }, ResolveTypegenMeta<TypegenDisabled, AnyEventObject, BaseActionObject, ServiceMap>>) => void) {
    const cuurentState = promiseService.getSnapshot();
    const nextState = event;
    if (!cuurentState.can(nextState)) {
      failedCallBack && failedCallBack(cuurentState)
    } else {
      promiseService.send(nextState);
    }
  }
}
