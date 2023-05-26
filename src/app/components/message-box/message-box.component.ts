import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { LogData, LogLevel } from 'src/app/models/ILogstashService';
import { timer } from 'rxjs';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.sass']
})
export class MessageBoxComponent implements AfterViewInit{
  
  @ViewChild('terminal') terminal?: ElementRef<HTMLElement>;

  @Input() msgList: LogData[] = []
  @Input() title: string = ''
  clientWidth = 0;
  detailsData?: any;
  LogLevel = LogLevel;

  @HostListener('window:scroll')
  updateBoxWidth() {
    const width = this.terminal?.nativeElement.clientWidth;
    if(width ){
      timer(100).subscribe(()=>{
        this.clientWidth = width;
      })
    }
  }


  ngAfterViewInit(): void {
    this.updateBoxWidth();
  }

  displayDetails(data: LogData){
    let msg = ''
    try {
      msg = JSON.parse(data.msg)
    } catch (error) {
      // 轉換失敗就走純字串
      msg = data.msg 
    }
    this.detailsData = {
      ...data,
      msg
    }
  }
  hideDetails() {
    this.detailsData = undefined;
  }
}
