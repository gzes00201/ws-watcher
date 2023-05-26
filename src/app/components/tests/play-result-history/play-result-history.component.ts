import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WsTestLogstashService } from 'src/app/services/ws-test-logstash.service';
import { Subscription } from 'rxjs';
import { TestLogData } from 'src/app/models/IWsTestLogstashService';

@Component({
  selector: 'app-play-result-history',
  templateUrl: './play-result-history.component.html',
  styleUrls: ['./play-result-history.component.sass']
})
export class PlayResultHistoryComponent implements OnInit,OnChanges, OnDestroy {
  @Input() selectedIndex: number = 0;


  logs: TestLogData[] = [];
  logSb?: Subscription;

  constructor(private testLogstashService: WsTestLogstashService) {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['selectedIndex'].currentValue !==1 && changes['selectedIndex'].previousValue === 1){
      //  切換離開當前頁面
      this.setReadAll();
    }
  }
  ngOnDestroy(): void {
    this.logSb && this.logSb.unsubscribe();
  }

  ngOnInit(): void {
    this.testLogstashService.getAllHistroyLog(100).subscribe(logs => {
      this.logs = logs
      this.bindLogs();
    })
  }

  bindLogs() {
    this.logSb = this.testLogstashService.log$.subscribe((log)=>{
      this.logs.unshift(log)
      this.logs.splice(100,100)
    })
  }

  setReadAll() {
    this.testLogstashService.readAll()
    this.logs.forEach(log=> {
      log.isRead = true;
    })


  }
}
