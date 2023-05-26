
import { Injectable } from '@angular/core';

interface UrlParseURL {
  protocol: string;
  hostname: string;
  pathname: string;
}
@Injectable({
  providedIn: 'root'
})
export class UrlParse {
  /**
   * 取得 url 的 query string
   *
   * @param name query string's key
   * @param url url
   *
   * @returns keyvalue
   */
  getUrlParams(name: string, url: string): string | null{
    if (!url) {
      return '';
    }

    const _name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + _name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);

    if (!results) {
      return null;
    }

    if (!results[2]) {
      return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  getURL(link: string): UrlParseURL {
    const url: UrlParseURL = {
      protocol: '',
      hostname: '',
      pathname: '',
    }

    if(!this.isUrl(link)){
      return url;
    }

    const protocol= link.split('://')[0];
    if(protocol){
      url.protocol= protocol + ':';
    }

    const lastUrl = link.split('://')[1];
    if(lastUrl) {
      const lastUrlList = lastUrl.split('/');
      const hostname = lastUrlList.shift();
      if(hostname){
        url.hostname = hostname;
      }

      const pathname = lastUrlList.join('/');
      if(pathname) {
        url.pathname = pathname;
      }

    }

    return url;
  }

  private isUrl(value: string): boolean{
    var url = value.trim();
    if (!url) {
      return false;
    }

    if (/^((https?|s?ftp|wss?|s):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url)) {
        return true;
    } else {
        return false;
    }
}
}
