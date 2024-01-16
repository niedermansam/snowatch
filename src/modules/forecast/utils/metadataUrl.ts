 import { z } from "zod";
import { translateBearing } from "~/common/utils/translateBearing";
import { METERS_TO_MILES } from "~/common/utils/units"; 

export const metadataUrl = (lat: number, lng: number) =>
  `${API_URL}${lat},${lng}`;
export const validateMetadata = z.object({
  properties: z.object({
    gridId: z.string(),
    forecast: z.string().url(),
    forecastHourly: z.string().url(),
    relativeLocation: z.object({
      properties: z.object({
        city: z.string(),
        state: z.string(),
        distance: z
          .object({
            value: z.number(),
            unitCode: z.string(),
          })
          .transform((data) => data.value * METERS_TO_MILES),
        bearing: z
          .object({
            value: z.number(),
            unitCode: z.string(),
          })
          .transform((data) => translateBearing(data.value)),
      }),
    }),
  }),
});

export type NoaaMetadata = z.infer<typeof validateMetadata>;
export const API_URL = "https://api.weather.gov/points/";
