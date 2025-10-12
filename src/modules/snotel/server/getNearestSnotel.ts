import { env } from "~/env.mjs";
import { nearbySnotelMetadata } from "../types";
import { nearestSnotelAPI } from "./nearestSnotelApi";

export async function getNearestSnotel(
  geohash: string,
  n: number,
  minElevation = 0,
) {
  try {
  const response  = await nearestSnotelAPI(geohash, n, minElevation)
  

  const safeData = nearbySnotelMetadata.parse(response);
  return safeData;
  } catch (error) {
    console.log("Error fetching nearest snotel")
    console.error(error)
    throw error
  }



}
