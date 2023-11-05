'use server';
import { nearbySnotelMetadata } from "../types";

export async function getNearestSnotel(
  geohash: string,
  n: number,
  minElevation = 0
) {
  const response = await fetch(
    `/api/snotel/near/${geohash}/${n}?minElevation=${minElevation}`,
    {
      cache: "force-cache",
    }
  );

  const snotel = (await response.json()) as unknown;

  const safeData = nearbySnotelMetadata.parse(snotel);

  return safeData;
}
