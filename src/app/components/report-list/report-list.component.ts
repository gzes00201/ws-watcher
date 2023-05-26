import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import { LogData, LogLevel } from 'src/app/models/ILogstashService';
import { ReportItem } from 'src/app/models/IReportService';
import { LogstashService } from '../../services/logstash.service';
import { ReportService } from '../../services/report.service';




/**
 * @title Table with filtering
 */
@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.sass']
})
export class ReportListComponent implements OnInit {
  displayedColumns: string[] = ['timestamp', 'category', 'title', 'value'];
  
  list: ReportItem[] = []
  dataSource = new MatTableDataSource(this.list);

  constructor(
    private logs: LogstashService,
    private report: ReportService
    ){

  }
  ngOnInit(): void {
    this.logs.isReady.subscribe(isReady=>{
      if(isReady){
        this.logs.log$.subscribe(log=>{
          this.handelReport(log);
        })
        this.report.report$.subscribe(report=>{
          this.dataSource.data = this.dataSource.data.concat(report)
        })
        this.report.getHistroy().subscribe(reports=>{
          this.dataSource.data  = this.dataSource.data.concat(reports);
        })
      }
    })
  }

  private handelReport(log: LogData){
    if(log.event === 'gusher_disconnected' && log.level === LogLevel.ERROR){
      // 真正的用戶斷線
      this.updateDisconnectedReport(log);
    }
  }

  

  private updateDisconnectedReport(log: LogData) {
    try {
      const disconnectedData = JSON.parse(log.msg);
      const report: ReportItem = {
        timestamp: log.timestamp,
        category: 'gusher_disconnected',
        title: 'gusher持續連線時間 (ms)',
        value: disconnectedData.session_time,
      };
      this.report.push(report)
     
    } catch (error) {
      console.error('斷線資料格式解析錯誤', error);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


}
