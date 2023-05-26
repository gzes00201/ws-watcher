import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { ILogstashService, LogData } from '../models/ILogstashService';
import { DbService, DB_NAME } from './db.service';

@Injectable({
  providedIn: 'root'
})
export class LogstashService implements ILogstashService {

  log$: Subject<LogData>;
  isReady = new BehaviorSubject<boolean>(false);
  constructor(private db: DbService) {
    this.log$ = new Subject<LogData>();
    this.db.initialize().subscribe(isInit=>{
      this.isReady.next(true);
    })
   }

  getAllHistroyLog(count: number): Observable<LogData[]> {
    return this.db.get(DB_NAME.LOGS, '', count).pipe(
      map((res: any)=> {
        return res.reverse()
      })
    )
  }

  push(data: LogData): void {
    this.log$.next(data)
    this.db.put(DB_NAME.LOGS, data).subscribe()
  }
}
