import type {
  NoaaForecastDiscussionMetadata,
  NoaaForecast,
  NoaaMetadata,
  NoaaForecastDiscussion,
} from "~/modules/forecast/types";
import { METERS_TO_FEET } from "../../utils/units";

type ForecastPeriod = NoaaForecast["properties"]["periods"][number];

type SnoWatchForecast = NoaaForecast["properties"]["periods"];

const parseSnowData = (data: NoaaForecast["properties"]["periods"][number]) => {
  const outputObject = {
    low: 0,
    high: 0,
    text: "",
  };

  const snowMatch = data.detailedForecast.match(
    /new snow accumulation of (.*) possible/i
  );

  if (!snowMatch) return { ...data, snow: outputObject };

  let snowText = snowMatch[1];

  if (!snowText) return { ...data, snow: outputObject };

  if (snowText.includes("less than")) {
    snowText = snowText.replace(/.*one quanter of one/, " 0 to 0.25");
    snowText = snowText.replace(/.*one third of one/, " 0 to 0.25");
    snowText = snowText.replace(/.*(a )?half (an )?inch/, "0 to 0.5");
    snowText = snowText.replace(/.*less than one/, "0 to 1");
  }

  if (snowText.includes("around")) {
    snowText = snowText.replace(/.around* (a )?half (an )?inch/, "0.5 to 0.5");
    snowText = snowText.replace(/.*around one/, "1 to 1");
    snowText = snowText.replace(/.*around two/, "2 to 2");
  }

  outputObject.text = snowText;
  const snowAmountMatch = snowText.match(/([\d|\.]+) to ([\d|\.]+)/i);

  if (!snowAmountMatch) return { ...data, snow: outputObject };

  outputObject.low = parseFloat(snowAmountMatch[1] || "0");
  outputObject.high = parseFloat(snowAmountMatch[2] || "0");

  return { ...data, snow: outputObject };
};

class FullForecast {
  coordinates: number[][][];
  updated: Date;
  data: ReturnType<typeof parseSnowData>[];
  elevation: { meters: number; ft: number };
  cumulativeSnow: {
    low: number;
    high: number;
  };

  constructor(data: NoaaForecast) {
    this.coordinates = data.geometry.coordinates;
    this.updated = new Date(data.properties.updated);
    this.elevation = {
      meters: data.properties.elevation.value,
      ft: data.properties.elevation.value * METERS_TO_FEET,
    };

    const snowData = data.properties.periods.map(parseSnowData);

    this.data = snowData;
    this.cumulativeSnow = this.getCumulativeSnow();
  }

  getDates() {
    return this.data.map((period) => new Date(period.startTime));
  }

  getNames() {
    return this.data.map((period) => period.name);
  }

  getSnow() {
    return this.data.map((period) => period.snow);
  }

  getLowSnow() {
    return this.data.map((period) => period.snow.low);
  }

  getHighSnow(difference = false) {
    if (difference)
      return this.data.map((period) => period.snow.high - period.snow.low);
    return this.data.map((period) => period.snow.high);
  }

  getCumulativeSnowArray(lowOrHigh: "low" | "high") {
    let cumulativeTotal = 0;
    return this.data.map((period, index) => {
      if (index === 0) {
        cumulativeTotal = period.snow[lowOrHigh];
        return cumulativeTotal;
      }

      cumulativeTotal += period.snow[lowOrHigh];

      return cumulativeTotal;
    });
  }

  private getCumulativeSnow() {
    const snowArray = this.getSnowArray();
    const low = snowArray.reduce((a, b) => a + b.low, 0);
    const high = snowArray.reduce((a, b) => a + b.high, 0);
    return { low, high };
  }

  private getSnowArray() {
    return this.data.map((period) => period.snow);
  }

  getTemperatureArray() {
    return this.data.map((period) => period.temperature);
  }
}

export type FullForecastInstance = InstanceType<typeof FullForecast>;

class ForecastDiscussion {
  discussion: NoaaForecastDiscussion["productText"];
  issuedAt: Date;

  constructor(data: NoaaForecastDiscussion) {
    this.discussion = data.productText;
    this.issuedAt = new Date(data.issuanceTime);
  }

  private getCleanDiscussion(discussion: string) {
    const justTheDiscussion = discussion.match(/DISCUSSION...(.*)AVIATION/);
  }
}

type ForecastDiscussionMetadata =
  NoaaForecastDiscussionMetadata["@graph"][number] & {
    discussion?: InstanceType<typeof ForecastDiscussion>;
  };

class ForecastDiscussionList {
  discussionMetadata: ForecastDiscussionMetadata[];

  constructor(data: NoaaForecastDiscussionMetadata) {
    this.discussionMetadata = data["@graph"];

    this.getDiscussion(0)
      .then((discussion) => {
        console.log(discussion);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async getDiscussion(index: number) {
    const discussionObject = this.discussionMetadata[index];
    if (!discussionObject) return;
    const response = await fetch(discussionObject["@id"]);

    const data = (await response.json()) as NoaaForecastDiscussion;

    const discussion = new ForecastDiscussion(data);

    discussionObject.discussion = discussion;

    return discussion;
  }
}

export default class Forecast {
  lat: number;
  lon: number;

  private metadata?: NoaaMetadata;

  forecast?: InstanceType<typeof FullForecast>;
  forecastDiscussion?: InstanceType<typeof ForecastDiscussionList>;

  constructor(lat: number, lon: number) {
    this.lat = lat;
    this.lon = lon;
  }

  async getMetadata() {
    const response = await fetch(
      `https://api.weather.gov/points/${this.lat},${this.lon}`
    );
    const data = (await response.json()) as NoaaMetadata;
    this.metadata = data;
    return data;
  }

  async getForecast() {
    if (!this.metadata) {
      await this.getMetadata();
    }
    if (!this.metadata || !this.metadata.properties.forecast) return;
    const response = await fetch(this.metadata.properties.forecast, {
      next: {
        revalidate: 10,
      },
    });
    const data = (await response.json()) as NoaaForecast;

    const forecast = new FullForecast(data);
    this.forecast = forecast;

    return forecast;
  }

  async getForecastDiscussionMetadata() {
    if (!this.metadata) {
      await this.getMetadata();
    }
    if (!this.metadata) return;
    const response = await fetch(
      `https://api.weather.gov/products/types/AFD/locations/${this.metadata.properties.gridId}`
    );
    const data = (await response.json()) as NoaaForecastDiscussionMetadata;

    this.forecastDiscussion = new ForecastDiscussionList(data);
    return this.forecastDiscussion;
  }
}
