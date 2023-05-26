import { Observable } from "rxjs";

export enum TestType {
    // 資料性錯誤
    DATA,

    // 流程性錯誤。
    PROCESS,
}
export class TestLogData{
    timestamp: number;
    type: TestType
    id: string
    msg: string
    isRead: boolean
    history: History[]

    constructor(payload: TestLogData = {timestamp: new Date().getTime(), type: TestType.DATA, id: '', msg:'', isRead: false , history: []}){
        this.timestamp = payload.timestamp
        this.type = payload.type
        this.id = payload.id
        this.msg = payload.msg
        this.isRead = payload.isRead
        this.history = payload.history;
    }
}


export interface IWSTestLogstashService {
    log$: Observable<TestLogData>;
    onLogUpdate: Observable<TestLogData[]>;
    isReady: Observable<boolean>;
    push(data: TestLogData): void;
    getAllHistroyLog(count: number): Observable<TestLogData[]>;
}

export interface History {
  date: string;
  event: string;
  msg: string;
}
