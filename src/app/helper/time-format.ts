
export function timeOffsetToZone(timeOffset: number): string {
  const symbol = timeOffset < 0 ? '+' : '-';
  const time =  Math.abs(timeOffset);
  const word = new Date(Number(time) * 1000).toISOString();
  return symbol + word.substr(14, 5);
}

/**
 * 產生日期物件
 * 針對瀏覽器相容性調整
 */
export function getDateObjectUseString(timeString: string): Date {
  let currentDate = new Date(timeString);
  if (isNaN(currentDate.getTime())) {
    currentDate = new Date(`${timeString.replace(/-/g, '/')}`);
  }
  return currentDate;
}
