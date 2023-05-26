import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { IReportService, ReportItem } from 'src/app/models/IReportService';
import { DbService, DB_NAME } from 'src/app/services/db.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService implements IReportService{
  public get report$(): Observable<ReportItem>{
    return this._report$
  }
  private _report$: Subject<ReportItem>;

  constructor(private db: DbService) { 
    this._report$ = new Subject<ReportItem>();
  }

  push(report: ReportItem): void {
    this._report$.next(report)
    this.db.put(DB_NAME.REPORT, report).subscribe()
  }

  getHistroy(count=9999): Observable<ReportItem[]>{
    return this.db.get(DB_NAME.REPORT, '', count).pipe(
      map(res => res as ReportItem[])
    )
  }
}
