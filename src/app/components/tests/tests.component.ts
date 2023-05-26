import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { LogData,LogLevel } from 'src/app/models/ILogstashService';
import { LogstashService } from 'src/app/services/logstash.service';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.sass']
})
export class TestsComponent {
  selectedIndex = 0
  eventMsgList: LogData[] = []
  constructor(public logger: LogstashService){

  }

  ngOnInit(){
    this.logger.isReady.subscribe(isReady=>{
      if(isReady) {
        this.getHistroyLog();
        this.bindLogStreaming();
      }
    })
  }

  goHistory() {
    this.selectedIndex = 1
  }

  hh(event: MatTabChangeEvent) {
    console.log(event)
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
    this.eventMsgList = logs.filter(d=> ([LogLevel.NOTICE, LogLevel.ERROR].includes(d.level)) );
    this.eventMsgList.splice(1000)
  }

  private handelLog(log: LogData) {
    if ([LogLevel.NOTICE, LogLevel.ERROR].includes(log.level)) {
      // 事件 訊息，保留前1000則
      this.eventMsgList.unshift(log);
      this.eventMsgList.splice(1000);
    }
  }
}
