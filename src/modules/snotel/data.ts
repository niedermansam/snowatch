import { processSnotelCSV } from "./processSnotelCSV";
import type { SnotelData } from "./types";

export class Snotel {
  id: string;
  dailyData: {
    waterYear: SnotelData[];
    calendarYear: SnotelData[];
    thirtyDay: SnotelData[];
  } = {
    waterYear: [],
    calendarYear: [],
    thirtyDay: [],
  };
  daily: SnotelData[] = [];
  hourly: SnotelData[] = [];

  constructor(id: string) {
    this.id = id;
  }

  private get30DayUrl() {
    return `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/daily/${this.id}%7Cid=%22%22%7Cname/-30,0/WTEQ::value,WTEQ::delta,SNWD::value,SNWD::delta,TAVG::value,TMIN::value,TMAX::value,SNDN::value?fitToScreen=false`;
  }

  async get30DayData() {
    const url = this.get30DayUrl();
    const response = await fetch(url, {
      next: {
        revalidate: 60 * 30,
      },
    });
    const data = await response.text();
    const json = processSnotelCSV(data);

    this.daily = json;

    return json;
  }

  private getWaterYearDailyUrl() {
    return `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/daily/${this.id}%7Cid=%22%22%7Cname/CurrentWY,CurrentWYEnd/WTEQ::value,WTEQ::delta,SNWD::value,SNWD::delta,TAVG::value,TMIN::value,TMAX::value,SNDN::value?fitToScreen=false`;
  }

  private getHourlyUrl() {
    return `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/hourly/${this.id}%7Cid=%22%22%7Cname/-23,0/WTEQ::value,WTEQ::delta,SNWD::value,SNWD::delta,TAVG::value,TMIN::value,TMAX::value,SNDN::value?fitToScreen=false`;
  }

  private getCalendarYearDailyUrl() {
    return `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/daily/start_of_period/${this.id}%7Cid=%22%22%7Cname/CurrentCY,CurrentCYEnd/WTEQ::value,WTEQ::median_1991,WTEQ::pctOfMedian_1991,SNWD::value,PREC::value,PREC::median_1991,PREC::pctOfMedian_1991,TMAX::value,TMIN::value,TAVG::value?fitToScreen=false`;
  }

  async getWaterYearDailyData() {
    const url = this.getWaterYearDailyUrl();
    const response = await fetch(url, {
      next: {
        revalidate: 60 * 30,
      },
    });
    const data = await response.text();
    const json = processSnotelCSV(data);

    this.daily = json;
    return json;
  }

  async getCalendarYearDailyData() {
    const url = this.getCalendarYearDailyUrl();
    const response = await fetch(url, {
      next: {
        revalidate: 0, //60 * 30,
      },
    });
    const data = await response.text();
    const json = processSnotelCSV(data);

    // console.log(json);

    this.daily = json;
    return json;
  }

  getDailySnowGraphData() {
    const dates: string[] = [];
    const snowDepth: number[] = [];
    this.daily.forEach((datum) => {
      if (datum.date && datum.snow.depth !== null) {
        dates.push(datum.date.toLocaleDateString());
        snowDepth.push(datum.snow.depth);
      }
    });

    return { xAxis: dates, snowDepth };
  }

  getDailyTemperatureData() {
    const xAxis: string[] = [];
    const avg: number[] = [];
    const high: (number | null)[] = [];
    const low: (number | null)[] = [];
    this.daily.forEach((datum) => {
      if (datum.date && datum.temp.avg) {
        xAxis.push(datum.date.toLocaleDateString());
        avg.push(datum.temp.avg);
        high.push(datum.temp.max || null);
        low.push(datum.temp.min || null);
      }
    });
    return { xAxis, avg, high, low };
  }

  async getHourlyData() {
    const url = this.getHourlyUrl();
    const response = await fetch(url);
    const data = await response.text();
    const json = processSnotelCSV(data);

    this.hourly = json;
    return json;
  }
}
