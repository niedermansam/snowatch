"use client";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

export function extractSnowfall(text: string): [number, number] {
  // Match the snow accumulation pattern

  // a snow numbers pattern to capture the digits from sentences like "1 to 2 cm" "15 to 20 cm" "less than 1 cm" or "around 3 cm" preceeded by the word "snow" but with optional words in between
  const snowNumbersPattern =
    /snow(?:\s+(?:accumulation|amount|total))?.*?(\d+(?:[.,]\d+)?)\s*(?:to|and|or|,|-|–)?\s*(\d+(?:[.,]\d+)?)?\s*cm/i;

  const match = snowNumbersPattern.exec(text);

  if (match) {
    // Replace commas with periods and parse the numbers
    const firstNumber = parseFloat((match[1] ?? "0").replace(",", "."));
    const secondNumber = parseFloat(
      (match[2] ?? match[1] ?? "0").replace(",", ".")
    );

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
) => {
  const query = useQuery({
    queryKey: ["daily-forecast", position],
    enabled: !!url,
    queryFn: async () => {
      if (!url) throw new Error("No URL provided");
      try {
        const res = await fetch(url + "?units=si");

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
          minSnowFall += snowfall[0];
          maxSnowFall += snowfall[1];
          dailySnowfall.push(snowfall);
          return {
            ...period,
            snow: {
              min: minSnowFall,
              max: maxSnowFall,
            },
          };
        }); 
        return {
          data: newPeriods,
          snowfall: {
            min: minSnowFall,
            max: maxSnowFall,
            daily: dailySnowfall,
          },
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
  };
};
