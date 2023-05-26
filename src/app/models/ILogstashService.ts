import { Observable } from "rxjs";

export enum LogLevel {
    // 日誌條目沒有指定的嚴重性級別。
    DEFAULT=0,
    
    // 調試或跟踪信息。
    DEBUG=100,
    
    // 常規信息，例如正在進行的狀態或性能。
    INFO=200,
    
    // 正常但重要的事件，例如啟動，關閉或配置更改。
    NOTICE=300,
    
    // 警告事件可能會導致問題。
    WARN=400,
    
    // 錯誤事件可能會導致問題。
    ERROR=500,
    
    // 嚴重事件會導致更嚴重的問題或中斷。
    CRITICAL=600,
    
    // 一個人必須立即採取行動。
    ALERT=700,
    
    // 一個或多個系統無法使用。
    EMERENCY=800,
}
export class LogData{
    timestamp: number;
    level: LogLevel
    event: string
    msg: string

    constructor(payload: LogData = {timestamp: new Date().getTime(), level: LogLevel.DEFAULT, event: '', msg:'' }){
        this.timestamp = payload.timestamp
        this.level = payload.level
        this.event = payload.event
        this.msg = payload.msg
    }
}


export interface ILogstashService {
    log$: Observable<LogData>;
    isReady: Observable<boolean>;
    push(data: LogData): void;
    getAllHistroyLog(count: number): Observable<LogData[]>;
}