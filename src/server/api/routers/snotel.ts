import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { sql } from "drizzle-orm";
import Geohash from "latlon-geohash";

export type SnotelMetadata = {
  id: string;
  name: string;
  elevation: number;
  lat: number;
  lon: number;
  state: string;
  dist: number;
  bearing: number;
};

export const snotelRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        hash: z.string(),
        minElevation: z.number().optional(),
        maxElevation: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { limit, hash, minElevation, maxElevation } = input;
      const { lat, lon } = Geohash.decode(hash);

      //       console.log(lat, lon);
      //       const data = await ctx.db
      //         .execute(sql`SELECT id, name, elevation, lat, lon, state,
      // coords::geography <-> ST_SetSRID(ST_MakePoint( ${lon}, ${lat} ),4326)::geography AS dist,
      // ST_Azimuth( ST_SetSRID(ST_MakePoint(  ${lon}, ${lat} ),4326)::geography, coords::geography )/(2*pi())*360 AS bearing
      // FROM ${snotel}
      // WHERE elevation >= ${minElevation ?? 0} AND elevation <= ${maxElevation ?? 10000}
      // ORDER BY dist LIMIT ${limit ?? 6};`) as SnotelMetadata[];

      const data = await ctx.db.$queryRaw`
SELECT id, name, elevation, lat, lon, state,
ROUND((coords::geography <-> ST_SetSRID(ST_MakePoint( ${lon}::double precision, ${lat}::double precision ),4326)::geography)::double precision / 52.8) /100 AS dist,
ROUND(ST_Azimuth( ST_SetSRID(ST_MakePoint( ${lon}::double precision, ${lat}::double precision ),4326)::geography, coords::geography )/(2*pi())*360) AS bearing
FROM snotel 
WHERE elevation >= ${minElevation ?? 0} AND elevation <= ${
        maxElevation ?? 10000
      }
ORDER BY dist LIMIT ${limit ?? 6};`;

      return data as SnotelMetadata[];
    }),
});
