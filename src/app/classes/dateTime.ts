import { IDateTime } from 'src/app/models/IDateTime';
import { IDateTimeObject } from 'src/app/models/IDateTimeObject';
import { timeOffsetToZone } from 'src/app/helper/time-format';

function padLeft(str: string | number, length: number): string {
  const s = '' + str;
  return s.length >= length ? s : padLeft('0' + str, length);
}

function getTimeOfTimezone(changeTimezone: number) {
  const date = new Date();
  const timezoneOffset = date.getTimezoneOffset();

  let time = date.getTime();

  // 當地時間 + 當地時區差 + 轉換的時區差
  time = time + timezoneOffset * 60 * 1000 - changeTimezone * 60 * 1000;

  return time;
}

export class DateTime implements IDateTime {
  private date: Date;

  private timezoneOffset: number;

  private differenceOfTimezone: number;

  constructor() {
    this.date = new Date();

    this.timezoneOffset = this.date.getTimezoneOffset();

    this.differenceOfTimezone = 0;
  }

  getTimezoneOffset(): number {
    return this.timezoneOffset;
  }

  getTimezoneOffsetToZone(): string {
    return timeOffsetToZone(this.getTimezoneOffset());
  }

  setTimezoneOffset(timezoneOffset: number) {
    const timeOfTimezone = getTimeOfTimezone(timezoneOffset);

    this.differenceOfTimezone =
      this.differenceOfTimezone + this.date.getTime() - timeOfTimezone;

    this.date.setTime(timeOfTimezone);

    this.timezoneOffset = timezoneOffset;
  }

  getTime(): number {
    return this.date.getTime() + this.differenceOfTimezone;
  }

  setTime(timestamp: number) {
    this.date.setTime(timestamp - this.differenceOfTimezone);
  }

  toObject(date: any = this.date): IDateTimeObject {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hours: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds()
    };
  }

  toString(ooo?: any): string {
    const { year, month, day, hours, minutes, seconds } = this.toObject(ooo);

    const y = year;
    const m = padLeft(month, 2);
    const d = padLeft(day, 2);
    const h = padLeft(hours, 2);
    const min = padLeft(minutes, 2);
    const sec = padLeft(seconds, 2);

    return `${y}-${m}-${d} ${h}:${min}:${sec}`;
  }

  getOldDateString(days: number = 0) {
    const now = this.getTime();
    const msec = days * 24 * 60 * 60 * 1000;
    const nDate = new Date(now - msec - this.differenceOfTimezone);

    const y = nDate.getFullYear();
    const m = padLeft(nDate.getMonth() + 1, 2);
    const d = padLeft(nDate.getDate(), 2);

    return `${y}-${m}-${d}`;
  }
}
