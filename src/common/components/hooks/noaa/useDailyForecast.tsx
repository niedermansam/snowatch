"use client";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import type { ValidForecastPeriod } from "../../../../modules/forecast/server/getForecast";
import { useSettings } from "../../map/useSettings";
import { UnitConverter } from "~/app/UnitConverter";

const captureWindSpeed = /([0-9]+)( to ([0-9]+))?( )?mph/;

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
    /gust(s?) as high as (\d+) (mph|km\/h)/i
  );

  return parseInt(gusts?.[2] || "0") || null;
};

const parseWindData = (
  data: Pick<ValidForecastPeriod, "name" | "detailedForecast">
) => {
  const windMatch = data.detailedForecast?.match(captureWindSpeed);
  const gusts = data.detailedForecast.match(
    /gust(s?) as high as (\d+) (mph|km\/h)/i
  );
  const result = {
    lowSnow: parseInt(windMatch?.[1] || "0"),
    highSnow: parseInt(windMatch?.[3] || windMatch?.[1] || "0"),
    gusts: parseInt(gusts?.[2] || "0") || null,

    period: data.name,
  };

  return result;
};

export function extractSnowfall(text: string): [number, number] {
  // Match the snow accumulation pattern

  // a snow numbers pattern to capture the digits from sentences like "1 to 2 cm" "15 to 20 cm" "less than 1 cm" or "around 3 cm" preceeded by the word "snow" but with optional words in between
  const snowNumbersPattern = // /new\s+snow(?:\s+\w+)\s+(?:around|about|less\s+than|up\s+to|near|from)?\s*(\d+(?:\.\d+)?(?:\s*(?:to|-|–|—)\s*\d+(?:\.\d+)?)?)\s*(?:cm|in|cm\/in)/i
    /\..*new snow(?:\s+(?:accumulation|amount|total))?.*?(\d+(?:[.,]\d+)?)\s*(?:to|and|or|,|-|–)?\s*(\d+(?:[.,]\d+)?)?\s*(cm|in)/i;

  const match = snowNumbersPattern.exec(text);

  console.log("Extracting snowfall from text2:", text, match);

  if (match) {
    // Replace commas with periods and parse the numbers
    const firstNumber = parseFloat((match[1] ?? "0").replace(",", "."));
    const secondNumber = parseFloat(
      (match[2] ?? match[1] ?? "0").replace(",", ".")
    );

    console.log("Extracted snowfall from text:", text);
    console.table({
      text,
      firstNumber,
      secondNumber,
    });

    // Return a tuple with 0 if there's only one number
    return match[2] ? [firstNumber, secondNumber] : [0, firstNumber];
  }

  // Default if no match is found
  return [0, 0];
}

const validator = z.object({
  properties: z.object({
    periods: z.array(
      z.object({
        detailedForecast: z.string(),
      })
    ),
  }),
});

export const useDailyForecast = (
  url: string | undefined,
  position: { lat: number; lon: number }
  // units: "si" | "us"
) => {
  const { units } = useSettings();
  const query = useQuery({
    queryKey: ["daily-forecast", position],
    enabled: !!url,
    queryFn: async () => {
      if (!url) throw new Error("No URL provided");
      try {
        console.log("Fetching daily forecast from", url);
        const res = await fetch(url + `?units=us`);

        let minSnowFall = 0;
        let maxSnowFall = 0;

        const data = (await res.json()) as DailyForecastData;

        validator.parse(data);

        if ("elevation" in data.properties === false) {
          throw new Error("No elevation data in forecast");
        }

        const dailySnowfall: [number, number][] = [];

        const newPeriods = data.properties.periods.map((period) => {
          const snowfall = extractSnowfall(period.detailedForecast);
          // if(units === "imperial"){
          //   // convert from cm to inches
          //   snowfall = [
          //     snowfall[0] * 0.393701,
          //     snowfall[1] * 0.393701,
          //   ];
          // }
          minSnowFall += snowfall[0];
          maxSnowFall += snowfall[1];
          dailySnowfall.push(snowfall);
          return {
            ...period,
            minSnow: snowfall[0],
            maxSnow: snowfall[1],
            snow: {
              min: snowfall[0],
              max: snowfall[1],
            },
          };
        });
        return {
          data: newPeriods,
          gusts: newPeriods.map((p) => parseWindData(p).gusts),
          snowfall: {
            min: minSnowFall,
            max: maxSnowFall,
            daily: dailySnowfall,
          },
          ...data,
        };
      } catch {
        throw new Error(
          `Failed to fetch daily forecast for ${position.lat},${position.lon}`
        );
      }
    },
  });

  return query;
};
export type DailyForecastData = {
  properties: {
    periods: {
      number: number;
      name: string;
      startTime: string;
      endTime: string;
      isDaytime: boolean;
      temperature: number;
      temperatureUnit: string;
      temperatureTrend: null;
      probabilityOfPrecipitation: number;
      shortForecast: string;
      detailedForecast: string;
      windSpeed: string;
      windDirection: string;
    }[];
    generatedAt: string;
    elevation: {
      unitCode: string;
      value: number;
    };
  };
};
