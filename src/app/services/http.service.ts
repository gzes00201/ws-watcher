import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Header, IParam, IApiPayload } from 'src/app/models/api/IApiPayload';
import { FetchPolicy } from './config/httpData';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  httpClient: HttpClient;

  constructor(private http: HttpClient) {
    this.header = this.handleHttpHeader([
      // { key: 'Content-Type', value: 'application/json' },
      // { key: 'X-Requested-With', value: 'xmlhttprequest' },
    ]);
    this.cache = {};
    this.httpClient = this.http;
  }

  private header: HttpHeaders;
  private cache: any;

  // NOTE: 執行 Get 參數接口
  public get(
    payload: IApiPayload,
    param: any = {},
    fetchPolicy = FetchPolicy.networkOnly
  ): Observable<any> {
    if (this.cache[payload.url] && fetchPolicy === FetchPolicy.isCache) {
      return this.cache[payload.url];
    }

    const httpParamList: Array<IParam> = Object.keys(param)
      .filter((key) => param[key] !== undefined)
      .map((key: string) => ({
        key,
        value: param[key],
      }));
    const params = this.hadleHttpParam(httpParamList);
    const options = {
      headers: this.header,
      withCredentials: true,
      params,
    };

    const res = this.httpClient.get<any>(payload.url, options);

    if (fetchPolicy === FetchPolicy.networkOnly) {
      this.cache[payload.url] = res;
    }

    return res
  }

  // NOTE: 執行 Post 參數接口
  public post(
    payload: IApiPayload,
    param: any,
    headerOpt?: HttpHeaders
  ): Observable<any> {
    let tmpHeader = this.header;
    if (headerOpt) {
      tmpHeader = headerOpt;
    }
    const options = {
      headers: tmpHeader,
      withCredentials: true,
    };

    return this.httpClient.post<any>(payload.url, param, options);
  }

  // NOTE: 執行 delete 參數接口

  public delete(
    payload: IApiPayload,
    param: any,
    headerOpt?: HttpHeaders
  ): Observable<any> {
    let tmpHeader = this.header;
    if (headerOpt) {
      tmpHeader = headerOpt;
    }
    const options = {
      headers: tmpHeader,
      withCredentials: true,
      body: param,
    };

    return this.httpClient.delete<any>(payload.url, options);
  }

  // NOTE: 執行 Put 參數接口

  public put(payload: IApiPayload, param: any): Observable<any> {
    const putHeader = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('X-Requested-With', 'xmlhttprequest')
      .set('Accept', '*/*');

    const options = {
      headers: putHeader,
      withCredentials: true,
    };

    return this.httpClient.put<any>(payload.url, param, options);
  }

  // NOTE: 陣列產生 headers 設定
  private handleHttpHeader(list: Array<Header>): HttpHeaders {
    const res: any = {};
    list.forEach((item) => {
      res[item.key] = item.value;
    });
    return new HttpHeaders({ ...res });
  }

  // NOTE: 處理送出的參數
  private hadleHttpParam(param: Array<IParam>): HttpParams {
    let query = new HttpParams().set('timestamp', String(new Date().getTime()));
    param.forEach((item) => {
      query = query.append(
        item.key,
        Array.isArray(item.value) ? JSON.stringify(item.value) : item.value
      );
    });
    return query;
  }

}
