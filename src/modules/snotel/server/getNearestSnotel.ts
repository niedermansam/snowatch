import { env } from "~/env.mjs";
import { nearbySnotelMetadata } from "../types";
import { nearestSnotelAPI } from "./nearestSnotelApi";

export async function getNearestSnotel(
  geohash: string,
  n: number,
  minElevation = 0,
) {
  const response  = await nearestSnotelAPI(geohash, n, minElevation)
  

  const safeData = nearbySnotelMetadata.parse(response);

  return safeData;
}
