import { Component, OnInit } from '@angular/core';
import { LogData, LogLevel } from './models/ILogstashService';
import { LogstashService } from './services/logstash.service';
import { GusherService } from './services/gusher.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'ws-watcher';
  wsMsgList: LogData[] = []
  eventMsgList: LogData[] = []
  isWsInit= false;
  constructor(public logger: LogstashService, private gusher: GusherService){

  }
  ngOnInit(): void {
    this.gusher.onInitialized.subscribe(isInit=>{
      this.isWsInit = isInit;
    })
    this.logger.isReady.subscribe(isReady=>{
      if(isReady) {
        this.getHistroyLog();
        this.bindLogStreaming();
      }
    })
     
  }

  private getHistroyLog() {
  
    this.logger.getAllHistroyLog(1000).subscribe(res=>{
      this.handelHistoryLog(res);
    })
  }



  private bindLogStreaming() {
    this.logger.log$.subscribe(log => {
      this.handelLog(log);
    });
  }

  private handelHistoryLog(logs: LogData[]) {
    this.wsMsgList = logs.filter(d=> (d.level === LogLevel.INFO));
    this.wsMsgList.splice(1000)
    this.eventMsgList = logs.filter(d=> ([LogLevel.NOTICE, LogLevel.ERROR].includes(d.level)) );
    this.eventMsgList.splice(1000)
  }
 
  private handelLog(log: LogData) {
    if (log.level === LogLevel.INFO) {
      // 日誌訊息，保留前1000則
      this.wsMsgList.unshift(log);
      this.wsMsgList.splice(1000);
    }

    if ([LogLevel.NOTICE, LogLevel.ERROR].includes(log.level)) {
      // 事件 訊息，保留前1000則
      this.eventMsgList.unshift(log);
      this.eventMsgList.splice(1000);
    }
  }
}
