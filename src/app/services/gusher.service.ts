import { Injectable } from '@angular/core';
import { Gusher } from '@xpomelox/gusher';
import { Channel } from '@xpomelox/gusher/lib/channel';
import { UrlParse } from 'src/app/classes/url-parse';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { GusherFactory } from './gusher.factory';
import {
  get
} from 'lodash';
import { LogstashService } from './logstash.service';
import { LogData, LogLevel } from '../models/ILogstashService';

export interface GSContentInfo {
  gsc: string;
  uuid?: string;
  channels?: {
    private: GSPrivateChannels
  }
}
interface GSPrivateChannels {
  [key: string]: string
}
export interface ChannelSubscription {
  bind: (fn: any) => Subscription;
  unbind: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class GusherService  {
  gusher?: Gusher;

  private channels: Map<string, Channel> = new Map();
  public privateChannels: Map<string, string> = new Map();
  onInitialized: Subject<boolean> = new BehaviorSubject<boolean>(false);
  onGusherStatusChanged: Subject<string> = new Subject<string>();

  private hallOddChannel: ChannelSubscription[] = [];
  uuid = '';

  // 因開發而手動斷開連線
  devClose = false;
  private startConnectTime = new Date().getTime();

  constructor(
    private factory: GusherFactory,
    private logger: LogstashService
  ) {}

  connect(data: GSContentInfo): Observable<boolean> {
    return new Observable((subscriber) => {
      this.gusher = this.createGusher(data);
      this.gusher.connect();
      this.devClose = false;
      this.startConnectTime = new Date().getTime();
      this.onInitialized.next(true);
      subscriber.next(true);
      subscriber.complete();
    });
  }

  reconnect() {
    window.location.reload();
  }

  getChannel(channel: string): Channel {
    let channelData: any 
    if (this.channels.get(channel)) {
      channelData= this.channels.get(channel);
    }
    channelData = this.gusher && this.gusher.subscribe(channel);

    return channelData
  }

  removeChannel(channel: string) {
    if(!this.gusher){
      return;
    }
    this.gusher.unsubscribe(channel);
  }

  bindChannelEvent(channel: Channel, eventName: string): ChannelSubscription {
    console.log(channel, eventName)
    const event = new Subject<any>();

    const bindEvent = (data: any) => {
      event.next(data);
    };

    channel.bind(eventName, bindEvent);

    event.subscribe({
      next: () => {},
      error: () => {},
      complete: () => {
        channel.unbind(eventName, bindEvent);
      }}
    );
    return {
      bind: (fn) => event.subscribe(fn),
      unbind: () => event.complete(),
    };
  }

  private createGusher(data: GSContentInfo): Gusher {
    const { gsc } = data;

    if (this.gusher) {
      return this.gusher;
    }

    let link = gsc || '';

    const wsURL = new UrlParse().getURL(link);

    if (window.location.protocol === 'https:' && wsURL.protocol === 'ws:') {
      link = `wss://${wsURL.hostname}/${wsURL.pathname}`;
    }
    const gusher = this.factory.create('BB', {
      url: link,
      token: '',
      // reconnection: false,
      // level: 'DEBUG'
    });
    // NOTE: gusher-js 錯誤待修
    gusher.connection.reconnection = false;

    // 測試用放在這
    const win: any = window
    win['gusher'] = gusher;

    this.bindEvnets(gusher);

    return gusher;
  }

  private bindEvnets(gusher: any) {
    gusher.bind('connected', () => {
      // this.bindGameChannels(data.ws.channels.game);
      this.logger.push(new LogData({
        timestamp: new Date().getTime(), 
        level: LogLevel.NOTICE, 
        event: 'gusher_connected', 
        msg: JSON.stringify({
          msg: 'gusher 已連線:' +   this.uuid 
      })
      }))
      this.changeGusherStatus();
    });

    gusher.bind('disconnected', () => {
      if(this.devClose){
        this.logger.push(new LogData({
          timestamp: new Date().getTime(), 
          level: LogLevel.NOTICE, 
          event: 'gusher_dev_disconnected', 
          msg:  JSON.stringify({
              msg: 'gusher 手動斷線:' +   this.uuid 
          })
        }))
      } else {
        this.logger.push(new LogData({
          timestamp: new Date().getTime(), 
          level: LogLevel.ERROR, 
          event: 'gusher_disconnected', 
          msg: JSON.stringify({
              msg: 'gusher 已斷線:' +   this.uuid,
              session_time: new Date().getTime() - this.startConnectTime
          })
        }))
      }
      this.changeGusherStatus();
    });

    gusher.bind('closed', (err: any) => {
      console.log('gusher error', err)
      this.logger.push(new LogData({
        timestamp: new Date().getTime(), 
        level: LogLevel.NOTICE, 
        event: 'gusher_error', 
        msg: JSON.stringify(err)
      }))
      this.changeGusherStatus();
    });

    gusher.bind('@closed', (err: any) => {
      console.log('gusher @closed', err)
      this.logger.push(new LogData({
        timestamp: new Date().getTime(), 
        level: LogLevel.NOTICE, 
        event: 'gusher_@closed', 
        msg: JSON.stringify(err)
      }))
      this.changeGusherStatus();
    });

    gusher.bind('error', (err: any) => {
      console.log('gusher error', err)
      this.logger.push(new LogData({
        timestamp: new Date().getTime(), 
        level: LogLevel.NOTICE, 
        event: 'gusher_error', 
        msg: JSON.stringify(err)
      }))
    });
  }

  changeGusherStatus() {

    if(!this.gusher){
      return;
    }
    if (this.gusher.connection.state === 'connected') {
      this.onGusherStatusChanged.next(this.gusher.connection.state);
    } else {
      this.onGusherStatusChanged.next(this.gusher.connection.state);
    }
  }

}
