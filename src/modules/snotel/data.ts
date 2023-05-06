
interface SnotelData {
  date: Date | null;
  swe: {
    value: number | null;
    change: number | null;
  };
  snow: {
    depth: number | null;
    change: number | null;
    density: number | null;
  };
  temp: {
    avg: number | null;
    min: number | null;
    max: number | null;
  };
}

function processSnotelDatum(str: string | undefined): number | null {
  if (str === "" || str === undefined) return null;
  return parseFloat(str);
}

function processSnotelCSV(csv: string) {
  // console.log(csv)
  // remove lines that start with #
  const lines = csv.split("\n").filter((line) => !line.startsWith("#"));

  let result: SnotelData[] = [];

  if (!lines[0]) return result;
  const headers = lines[0].split(",");

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    const obj: SnotelData = {
      date: null,
      swe: {
        value: null,
        change: null,
      },
      snow: {
        depth: null,
        change: null,
        density: null,
      },
      temp: {
        avg: null,
        min: null,
        max: null,
      },
    };

    if (currentLine) {
      const currentLineArray = currentLine.split(",");

      for (let j = 0; j < headers.length; j++) {
        const currentHeader = headers[j];
        const datum = currentLineArray[j];

        if (currentHeader !== undefined) {
          // console.log(currentHeader, datum)
          if (currentHeader.startsWith("Date"))
            obj.date = new Date(datum as string);
          if (currentHeader.startsWith("Snow Water Equivalent")) {
            obj.swe.value = processSnotelDatum(datum);
          }
          if (currentHeader.startsWith("Change In Snow Water Equivalent"))
            obj.swe.change = processSnotelDatum(datum);
          if (currentHeader.startsWith("Snow Depth"))
            obj.snow.depth = processSnotelDatum(datum);
          if (currentHeader.startsWith("Change In Snow Depth"))
            obj.snow.change = processSnotelDatum(datum);
          if (currentHeader.startsWith("Snow Density"))
            obj.snow.density = processSnotelDatum(datum);
          if (currentHeader.startsWith("Air Temperature Average"))
            obj.temp.avg = processSnotelDatum(datum);
          if (currentHeader.startsWith("Air Temperature Minimum"))
            obj.temp.min = processSnotelDatum(datum);
          if (currentHeader.startsWith("Air Temperature Maximum"))
            obj.temp.max = processSnotelDatum(datum);

          // obj[currentHeader] = datum;
        }
      }
      result = [...result, obj];
    }
  }
  return result;
}

export class Snotel {
  id: string;
  daily: SnotelData[] = [];
  hourly: SnotelData[] = [];

  constructor(id: string) {
    this.id = id;
  }

  private getWaterYearDailyUrl() {
    return `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/daily/${this.id}%7Cid=%22%22%7Cname/CurrentWY,CurrentWYEnd/WTEQ::value,WTEQ::delta,SNWD::value,SNWD::delta,TAVG::value,TMIN::value,TMAX::value,SNDN::value?fitToScreen=false`;
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

  private getHourlyUrl() {
    return `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/hourly/${this.id}%7Cid=%22%22%7Cname/-23,0/WTEQ::value,WTEQ::delta,SNWD::value,SNWD::delta,TAVG::value,TMIN::value,TMAX::value,SNDN::value?fitToScreen=false`;
  }

  getDailySnowGraphData() {
    const dates: string[] = [];
    const snowDepths: number[] = [];
    this.daily.forEach((datum) => {
      if (datum.date && datum.snow.depth) {
        dates.push(datum.date.toLocaleDateString());
        snowDepths.push(datum.snow.depth);
      }
    });
    
    return { dates, snowDepths };
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
