import { Observable } from "rxjs";

export interface ReportItem {
    timestamp: number;
    category: string
    title: string
    value: string
  }
  


export interface IReportService {
    report$: Observable<ReportItem>;
    push(data: ReportItem): void;

    getHistroy(count: number): Observable<ReportItem[]>
}