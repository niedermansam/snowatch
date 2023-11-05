import { z } from "zod";

export const nearbySnotelMetadata = z
  .object({
    id: z.string(),
    name: z.string(),
    elevation: z.number(),
    lat: z.number(),
    lon: z.number(),
    state: z.string(),
    county: z.string(),
    distance: z.number(),
    bearing: z.number(),
  })
  .array();


export type SnotelData = {
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
