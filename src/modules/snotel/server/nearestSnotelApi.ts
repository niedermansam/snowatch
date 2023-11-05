"use server";
import Geohash from "latlon-geohash";
import { FEET_TO_METERS } from "~/common/utils/units";
import { nearbySnotelMetadata } from "~/modules/snotel/types";
import { db } from "~/server/db";

export async function nearestSnotelAPI(
  geohash: string,
  n = 1,
  minElevation = 0
) {
  const { lat, lon } = Geohash.decode(geohash);

  const data = await db.$queryRaw`
SELECT id, name, elevation, lat, lon, state, county,
ROUND((coords::geography <-> ST_SetSRID(ST_MakePoint( ${lon}::double precision, ${lat}::double precision ),4326)::geography)::double precision / 52.8) /100 AS distance,
ROUND(ST_Azimuth( ST_SetSRID(ST_MakePoint( ${lon}::double precision, ${lat}::double precision ),4326)::geography, coords::geography )/(2*pi())*360) AS bearing
FROM snotel WHERE elevation > ${FEET_TO_METERS * minElevation}
ORDER BY distance LIMIT ${n};`;

  const safeData = nearbySnotelMetadata.parse(data);

  return safeData;
}
