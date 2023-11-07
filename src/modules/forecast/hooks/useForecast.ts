import { useQuery } from "@tanstack/react-query";
import Geohash from "latlon-geohash";
import { getForecastMetadata } from "../server/getMetadata";
import type { ValidForecastPeriod } from "../server/getForecast";
import { getForecast } from "../server/getForecast";

const parseSnowData = (
  data: ValidForecastPeriod
): {
  low: number;
  high: number;
  text: string;
  period: string;
  temperature: number;
  isDaytime: boolean;
} => {
  const outputObject = {
    low: 0,
    high: 0,
    text: "",
    period: data.name,
    temperature: data.temperature,
    isDaytime: data.isDaytime,
  };

  const snowMatch = data.detailedForecast.match(
    /new snow accumulation of (.*) possible/i
  );

  if (!snowMatch) return outputObject;

  let snowText = snowMatch[1];

  if (!snowText) return outputObject;

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

  if (!snowAmountMatch) return outputObject;

  outputObject.low = parseFloat(snowAmountMatch[1] || "0");
  outputObject.high = parseFloat(snowAmountMatch[2] || "0");

  return outputObject;
};

const captureWindSpeed = /(?<low>[0-9]+)( to (?<high>[0-9]+))?( )?mph/;

const parseWindData = (data: ValidForecastPeriod) => {
  const windMatch = data.windSpeed?.match(captureWindSpeed);
  const gusts = data.detailedForecast.match(
    /gust(s?) as high as (?<gusts>.\d+) mph/i
  );
  const result = {
    low: parseInt(windMatch?.groups?.low || "0"),
    high: parseInt(windMatch?.groups?.high || windMatch?.groups?.low || "0"),
    gusts: parseInt(gusts?.groups?.gusts || "0") || null,
    text: data.windSpeed,
    period: data.name,
  };

  return result;
};

function useForecast({ lat, lng }: { lat: number; lng: number }) {
  const geohash = Geohash.encode(lat, lng, 6);

  const metadata = useQuery(["forecast metadata", geohash], () =>
    getForecastMetadata(lat, lng)
  );

  const forecast = useQuery(
    ["forecast", geohash],
    async () => {
      if (!metadata.isSuccess) return;
      return getForecast(metadata.data.properties.forecast);
    },
    { enabled: metadata.isSuccess }
  );

  if (metadata.isError) {
    return {
      ...metadata,
      data: null,
      geohash,
    };
  }

  // console.log(forecast.data)

  const snowData = forecast.data?.properties.periods.map(parseSnowData) || [];

  const mostSnow = snowData.reduce(
    (acc, curr) => {
      if (curr.high > acc.high) return curr;
      return acc;
    },
    { low: 0, high: 0, text: "", period: "" }
  );

  const lowSnowfallEstimateTotal =
    snowData.reduce((acc, curr) => acc + curr.low, 0) || 0;
  const highSnowfallEstimateTotal =
    snowData.reduce((acc, curr) => acc + curr.high, 0) || 0;

  let totalSnowString = "";

  if (lowSnowfallEstimateTotal > 0 && highSnowfallEstimateTotal === 0) {
    totalSnowString = `At least ${lowSnowfallEstimateTotal}"`;
  }

  if (lowSnowfallEstimateTotal === 0 && highSnowfallEstimateTotal > 0) {
    totalSnowString = `Up to ${highSnowfallEstimateTotal}"`;
  }

  if (lowSnowfallEstimateTotal === highSnowfallEstimateTotal) {
    totalSnowString = `${lowSnowfallEstimateTotal}"`;
  }

  if (lowSnowfallEstimateTotal > 0 && highSnowfallEstimateTotal > 0) {
    totalSnowString = `${lowSnowfallEstimateTotal} to ${highSnowfallEstimateTotal}"`;
  }

  if (lowSnowfallEstimateTotal === highSnowfallEstimateTotal) {
    totalSnowString = `Up to ${lowSnowfallEstimateTotal}"`;
  }
  if (lowSnowfallEstimateTotal === 0 && highSnowfallEstimateTotal === 0) {
    totalSnowString = "No snow";
  }

  const nPeriods = snowData.length;

  return {
    ...forecast,

    elevation: forecast.data?.properties.elevation.value,
    getElevation: (unit: "F" | "M" = "F") => {
      if (!forecast.data?.properties.elevation.value) return null;
      if (unit === "F") {
        return Math.round(forecast.data?.properties.elevation.value * 3.28084);
      }
      return Math.round(forecast.data?.properties.elevation.value);
    },
    getDates: () =>
      forecast.data?.properties.periods.map((period) => period.startTime) || [],
    getDateLabels: () =>
      forecast.data?.properties.periods.map((period) => period.name) || [],

    geohash,
    snow: {
      total: totalSnowString,
      data: snowData,
      mostSnow,
      getLowSnow: () => snowData.map((period) => period.low),
      getHighSnow: (stacked = true) => snowData.map((period) => stacked ? period.high - period.low : period.high),
      getCumulativeLowSnow: () => {
        let cumulativeLowSnow = 0;

        return snowData.map((period) => {
          cumulativeLowSnow += period.low;
          return cumulativeLowSnow;
        });
      },
      getCumulativeHighSnow: () => {
        let cumulativeHighSnow = 0;

        return snowData.map((period) => {
          cumulativeHighSnow += period.high;
          return cumulativeHighSnow;
        });
      },
      getDateLabels: () => snowData.map((period) => period.period),
    },
    temperature: {
      getTemperature: () => snowData.map((period) => period.temperature),
      getHottestPeriod: () =>
        snowData.reduce(
          (acc, curr) => {
            if (curr.temperature > acc.temperature) return curr;
            return acc;
          },
          { low: 0, high: 0, text: "", period: "", temperature: 0 }
        ),
      getColdestDaytimePeriod: () =>
        snowData.reduce(
          (acc, curr) => {
            if (curr.temperature < acc.temperature && curr.isDaytime)
              return curr;
            return acc;
          },
          { low: 0, high: 0, text: "", period: "", temperature: 100 }
        ),
      getColdestPeriod: () =>
        snowData.reduce(
          (acc, curr) => {
            if (curr.temperature < acc.temperature) return curr;
            return acc;
          },
          { low: 0, high: 0, text: "", period: "", temperature: 100 }
        ),
      averageDaytimeHigh:
        (forecast.data?.properties.periods.reduce((acc, curr) => {
          if (curr.isDaytime && curr.temperature) {
            acc += curr.temperature;
          }
          return acc;
        }, 0) || 0) / nPeriods,

    },

    wind: {
      wind: forecast.data?.properties.periods.map(parseWindData) || [],
      getWindiestPeriod: function (gusts= true) {

        type WindPeriod = {
          low: number;
          high: number;
          gusts: number | null;
          text: string | null;
          period: string;
          highest?: number;
        };

        return this.wind.reduce< WindPeriod
        >(
          (acc, curr  ) => {
            const current:WindPeriod = curr



            if (!gusts && current.high > acc.high) return current;
            if (gusts) {
              current.highest = current.gusts || current.high || 0;

              const accummulatorHighest =   acc.highest || 0;


              if (current.highest > accummulatorHighest) {
                return current;
              }
            }
            return acc;
          },
          { low: 0, high: 0, gusts: 0, text: "", period: "", highest: 0 }
        );
      },

      getLowWind: function () {
        return this.wind.map((period) => period.low);
      },
      getHighWind: function () {
        return this.wind.map((period) => period.high);
      },

      getGusts: function (option?: "value" | "stacked") {
        if (option === "value" || option === undefined)
          return this.wind.map((period) => period.gusts);
        if (option === "stacked") {
          return this.wind.map((period) => {
            if (period.gusts === null) return 0;
            return period.gusts - period.high;
          });
        }
      },
    },
  };
}

export type Forecast = ReturnType<typeof useForecast>;

export default useForecast;
