
import { z } from "zod";

const API_URL = "https://api.weather.gov/points/";

 const metadataUrl = (lat: number, lng: number) =>
  `${API_URL}${lat},${lng}`;

 const validateMetadata = z.object({
  properties: z.object({
    forecast: z.string().url(),
    forecastHourly: z.string().url(),
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

