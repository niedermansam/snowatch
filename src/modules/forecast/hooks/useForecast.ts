import { useQuery, useQueryClient } from "@tanstack/react-query";
import Geohash from "latlon-geohash";
import { getForecastMetadata } from "../server/getMetadata";
import type { ValidForecastPeriod } from "../server/getForecast";
import { getForecast } from "../server/getForecast";
import { useEffect } from "react";

const captureWindSpeed = /(?<low>[0-9]+)( to (?<high>[0-9]+))?( )?mph/;

const parseSnowData = (data: ValidForecastPeriod) => {
  const gustMatch = parseGusts(data);

  const outputObject = {
    ...data,
    lowSnow: 0,
    highSnow: 0,
    snowText: "",
    period: data.name,
    temperature: data.temperature,
    isDaytime: data.isDaytime,
    gusts: gustMatch,
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

  outputObject.snowText = snowText;
  const snowAmountMatch = snowText.match(/([\d|\.]+) to ([\d|\.]+)/i);

  if (!snowAmountMatch) return outputObject;

  outputObject.lowSnow = parseFloat(snowAmountMatch[1] || "0");
  outputObject.highSnow = parseFloat(snowAmountMatch[2] || "0");

  return { ...outputObject };
};

const parseGusts = (data: ValidForecastPeriod) => {
  const gusts = data.detailedForecast.match(
    /gust(s?) as high as (?<gusts>.\d+) mph/i
  );
  return parseInt(gusts?.groups?.gusts || "0") || null;
};

const parseWindData = (data: ValidForecastPeriod) => {
  const windMatch = data.windSpeed?.match(captureWindSpeed);
  const gusts = data.detailedForecast.match(
    /gust(s?) as high as (?<gusts>.\d+) mph/i
  );
  const result = {
    lowSnow: parseInt(windMatch?.groups?.low || "0"),
    highSnow: parseInt(
      windMatch?.groups?.high || windMatch?.groups?.low || "0"
    ),
    gusts: parseInt(gusts?.groups?.gusts || "0") || null,
    text: data.windSpeed,
    period: data.name,
  };

  return result;
};

function useForecast({ lat, lng }: { lat: number; lng: number }) {
  const geohash = Geohash.encode(lat, lng, 6);
  const queryClient= useQueryClient()

  const metadata = useQuery(["forecast metadata", geohash], () =>
    getForecastMetadata(lat, lng)
  );
 
  const forecast = useQuery(
    ["forecast", geohash],
    async () => {
      if (!metadata.isSuccess || !metadata.data) return;
      return getForecast(metadata.data.properties.forecast);
    },
    { enabled: metadata.isSuccess && !!metadata.data  }
  );

  useEffect(() => {
    setTimeout( () => {
      if(!metadata.isLoading) return;
      console.log("try again")
      queryClient.invalidateQueries(["forecast metadata", geohash]).catch(e => console.log(e))

    }, 1000)
    // setTimeout(() => {
    //   forecast.refetch();
    // }
    // , 1000)
  }, [metadata, forecast])

  if (metadata.isError) {
    return {
      ...metadata,
      data: null,
      geohash,
    };
  }

  if (!metadata.data) {
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
      if (curr.highSnow > acc.highSnow) return curr;
      return acc;
    },
    { lowSnow: 0, highSnow: 0, snowText: "", period: "" }
  );

  const lowSnowfallEstimateTotal =
    snowData.reduce((acc, curr) => acc + curr.lowSnow, 0) || 0;
  const highSnowfallEstimateTotal =
    snowData.reduce((acc, curr) => acc + curr.highSnow, 0) || 0;

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

  const getElevation = (unit: "F" | "M" = "F") => {
    if (!forecast.data?.properties.elevation.value) return null;
    if (unit === "F") {
      return Math.round(forecast.data?.properties.elevation.value * 3.28084);
    }
    return Math.round(forecast.data?.properties.elevation.value);
  };

  const getRelativeLocation = () => {
    if(!metadata.data?.properties.relativeLocation) return null;
    const { distance, bearing, city, state } =
      metadata.data?.properties.relativeLocation.properties;
    return `${distance.toFixed(1)} miles ${bearing} of ${city}, ${state} at ${
      getElevation("F")?.toLocaleString() || ""
    } ft`;
  };

  const getLastPeriodName = () => {
    const periods = forecast.data?.properties.periods;
    if (!periods) return null;
    const lastPeriod = periods[periods.length - 1];

    if (!lastPeriod) return null;
    return lastPeriod.name;
  };

  return {
    ...forecast,
    data: {
      ...forecast.data,
      office: metadata.data.properties.gridId,
      metadata: {
        ...metadata.data?.properties,
        getRelativeLocation,
        getLastPeriodName,
      },
      elevation: forecast.data?.properties.elevation.value,
      getElevation: getElevation,
      getDates: () =>
        forecast.data?.properties.periods.map((period) => period.startTime) ||
        [],
      getDateLabels: () =>
        forecast.data?.properties.periods.map((period) => period.name) || [],

      geohash,
      snow: {
        total: totalSnowString,
        data: snowData,
        mostSnow,
        getLowSnowArray: () => snowData.map((period) => period.lowSnow),
        getHighSnow: (stacked = false) =>
          snowData.map((period) =>
            stacked ? period.highSnow - period.lowSnow : period.highSnow
          ),
        getCumulativeLowSnow: () => {
          let cumulativeLowSnow = 0;

          return snowData.map((period) => {
            cumulativeLowSnow += period.lowSnow;
            return cumulativeLowSnow;
          });
        },
        getCumulativeHighSnow: () => {
          let cumulativeHighSnow = 0;

          return snowData.map((period) => {
            cumulativeHighSnow += period.highSnow;
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
            { lowSnow: 0, highSnow: 0, snowText: "", period: "", temperature: 0 }
          ),
        getColdestDaytimePeriod: () =>
          snowData.reduce(
            (acc, curr) => {
              if (curr.temperature < acc.temperature && curr.isDaytime)
                return curr;
              return acc;
            },
            { lowSnow: 0, highSnow: 0, snowText: "", period: "", temperature: 100 }
          ),
        getColdestPeriod: () =>
          snowData.reduce(
            (acc, curr) => {
              if (curr.temperature < acc.temperature) return curr;
              return acc;
            },
            { lowSnow: 0, highSnow: 0, snowText: "", period: "", temperature: 100 }
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
        getWindiestPeriod: function (gusts = true) {
          type WindPeriod = {
            lowSnow: number;
            highSnow: number;
            gusts: number | null;
            text: string | null;
            period: string;
            highest?: number;
          };

          return this.wind.reduce<WindPeriod>(
            (acc, curr) => {
              const current: WindPeriod = curr;

              if (!gusts && current.highSnow > acc.highSnow) return current;
              if (gusts) {
                current.highest = current.gusts || current.highSnow || 0;

                const accummulatorHighest = acc.highest || 0;

                if (current.highest > accummulatorHighest) {
                  return current;
                }
              }
              return acc;
            },
            {
              lowSnow: 0,
              highSnow: 0,
              gusts: 0,
              text: "",
              period: "",
              highest: 0,
            }
          );
        },

        getLowWind: function () {
          return this.wind.map((period) => period.lowSnow);
        },
        getHighWind: function () {
          return this.wind.map((period) => period.highSnow);
        },

        getGusts: function (option?: "value" | "stacked") {
          if (option === "value" || option === undefined)
            return this.wind.map((period) => period.gusts);
          if (option === "stacked") {
            return this.wind.map((period) => {
              if (period.gusts === null) return 0;
              return period.gusts - period.highSnow;
            });
          }
        },
      },
    },
  };
}

export type UseForecastReturn = ReturnType<typeof useForecast>;

export type UseForecastData = UseForecastReturn["data"];

export default useForecast;
