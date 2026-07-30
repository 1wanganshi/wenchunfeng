declare module 'lunar-javascript' {
  export class Lunar {
    static fromDate(date: Date): Lunar;
    getYearInChinese(): string;      // 如 "二〇二六"
    getYearInGanZhi(): string;       // 干支，如 "丙午"
    getMonth(): number;              // 农历月，闰月为负
    getDay(): number;                // 农历日
    getTimeZhi(): string;            // 时辰地支，如 "午"
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
  }
}
