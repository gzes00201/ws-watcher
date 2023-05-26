import { Injectable } from '@angular/core';
import { Gusher, GusherOptions } from '@xpomelox/gusher';

@Injectable({
  providedIn: 'root'
})
export class GusherFactory {
  create(appKey: string , options: GusherOptions) {
    return new Gusher(appKey, options);
  }
}
