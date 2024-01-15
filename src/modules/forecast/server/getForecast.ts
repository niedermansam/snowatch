
'use server'
import { z } from "zod";

 const validateForecast = z.object({
  geometry: z.object({
    coordinates: z.array(z.array(z.array(z.number()))),
  }).optional(),
  properties: z.object({
    generatedAt: z.string().transform((val) =>  new Date(val)),
    elevation: z.object({
      value: z.number(),
      unitCode: z.string(),
    }),
    periods: z.array(
      z.object({
        name: z.string(),
        startTime: z.string().transform((val) => new Date(val)),
        shortForecast: z.string(),
        detailedForecast: z.string(),
        isDaytime: z.boolean(),
        temperature: z.number(),
        temperatureUnit: z.string(),
        windSpeed: z.string().nullable(),
        windDirection: z.string().nullable(),
        icon: z.string().url(),
        probabilityOfPrecipitation: z
          .object({ value: z.number().nullable() })
          .transform((val) => val.value),
        relativeHumidity: z
          .object({ value: z.number() })
          .transform((val) => val.value),
      })
    ),
  }),
});

export type NoaaForecast = z.infer<typeof validateForecast>;
export type ValidForecastPeriod = z.infer<
  typeof validateForecast
>["properties"]["periods"][number];


export async function getForecast(url: string) {
  try {
     const res = await fetch(url, {
        next: {
            revalidate:  60, // once a minute
        }
    });

     const data = (await res.json()) as unknown;
    const safeData= validateForecast.parse(data);

    return safeData;
  } catch (error) {
    console.log("ERROR FETCHING FORECAST DATA")
    console.error(error); 
  }
}