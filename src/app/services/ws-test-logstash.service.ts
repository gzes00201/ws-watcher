import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { DbService, DB_NAME } from './db.service';
import { IWSTestLogstashService, TestLogData } from '../models/IWsTestLogstashService';

@Injectable({
  providedIn: 'root'
})
export class WsTestLogstashService implements IWSTestLogstashService {
  log$: Subject<TestLogData>;
  isReady = new BehaviorSubject<boolean>(false);
  onLogUpdate: Subject<TestLogData[]>;
  private tempLogs:TestLogData[] = []
  constructor(private db: DbService) {
    this.log$ = new Subject<TestLogData>();
    this.onLogUpdate = new Subject<TestLogData[]>();
    this.db.initialize().subscribe(isInit=>{
      this.isReady.next(true);
    })
   }

  getAllHistroyLog(count: number): Observable<TestLogData[]> {
    return this.db.get(DB_NAME.TEST, '', count).pipe(
      map((res: any)=> {
        return res.reverse()
      }),
      tap(datas=> {
        this.tempLogs = datas;
        this.onLogUpdate.next(datas)
      })
    )
  }

  push(data: TestLogData): void {
    this.db.put(DB_NAME.TEST, data).subscribe()
    this.log$.next(data);
    this.tempLogs.unshift(data);
    this.onLogUpdate.next(this.tempLogs)
  }

  readAll() {
    this.db.$db.subscribe((db) => {
      if(!db){
          return
      }
      const transaction = db.transaction([DB_NAME.TEST], 'readwrite');

      const objectStore = transaction.objectStore(DB_NAME.TEST);
      
      const request =  objectStore.getAll(undefined, 9999) ;

      request.onerror = (error) => {
        console.error(error);
      };

      request.onsuccess = () => {
        const record = request.result;
        record.forEach(data=>{
          data.isRead = true;
          const updateRequest = objectStore.put(data);
          updateRequest.onsuccess = () => {
        }
        })
        this.tempLogs = [];
        this.onLogUpdate.next([])
      };
    });
  }
}
