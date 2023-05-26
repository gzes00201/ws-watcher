import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogData, LogLevel } from 'src/app/models/ILogstashService';
import { LogstashService } from 'src/app/services/logstash.service';
import { GSContentInfo, GusherService } from '../../services/gusher.service';


@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.sass']
})
export class ControlPanelComponent implements OnInit, OnDestroy {
  private subList: Subscription[] = [];
  config = {
    domain: '',
    port: '',
  }
  cookie: string = ``;
  isGusherConnected = false;
  linking = false;
  isAutoReLink = true;
  autoReLinkSb?: Subscription;
  connectAudio: HTMLAudioElement;

  constructor(
    public gusherService: GusherService,
    private logstashService: LogstashService,
    ) {
    this.connectAudio = document.createElement("audio");
    this.connectAudio.src = "assets/connect.mp3";
  }

  ngOnInit(): void {
    this.init();
    this.bindEvent();
  }

  ngOnDestroy(): void {
    this.logstashService.push(new LogData({
      timestamp: new Date().getTime(),
      level: LogLevel.NOTICE,
      event: 'logout',
      msg:'關閉監控'
    }))
    this.subList.forEach(sb=> sb.unsubscribe());

  }


  link() {
    this.linking = true;

    this.contentGusher()
  }

  change() {
    this.gusherService.gusher
  }

  disconnected() {
    this.gusherService.devClose = true;
    this.gusherService.gusher?.disconnect()
  }


  private bindEvent() {
    this.subList[0] = this.gusherService.onGusherStatusChanged.subscribe(status => {
      this.isGusherConnected = status === 'connected';
      if(this.isGusherConnected) {
        this.connectAudio.play();
      } else {
        if(this.isAutoReLink){
        }
      }
    });

  }

  private contentGusher() {

    const payload: GSContentInfo = {
      gsc: `ws://${this.config.domain}:${this.config.port}`,
    };
    this.gusherService.connect(payload).subscribe(()=>{

    });
  }

  private init() {
    this.config = {
      domain: '34.125.166.65',
      // domain: '0.0.0.0',
      port: '3000'
    };
  }

}
