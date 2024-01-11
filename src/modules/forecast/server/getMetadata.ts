
'use server'
import { z } from "zod";
import { translateBearing } from "~/common/utils/translateBearing";
import { METERS_TO_MILES } from "~/common/utils/units";

const API_URL = "https://api.weather.gov/points/";

 const metadataUrl = (lat: number, lng: number) =>
  `${API_URL}${lat},${lng}`;

 const validateMetadata = z.object({
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
       bearing: z.object({
         value: z.number(),
         unitCode: z.string(),
       }).transform((data) => translateBearing( data.value)),
     }),
   }),
   }),
 });

export type NoaaMetadata = z.infer<typeof validateMetadata>;

export async function  getForecastMetadata(lat: number, lng: number) {
    const res = await fetch(metadataUrl(lat, lng), {
        cache: 'force-cache'
    });
    const data = (await res.json()) as unknown;

    return validateMetadata.parse(data);
}

