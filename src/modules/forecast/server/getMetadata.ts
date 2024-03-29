"use server";
import { metadataUrl, validateMetadata } from "../utils/metadataUrl";
import { USER_AGENT } from "../utils/userAgents";

export async function getForecastMetadata(lat: number, lng: number) {
  try {
    const res = await fetch(metadataUrl(lat, lng), {
      cache: "force-cache", 
        headers: {
          'User-Agent': USER_AGENT
        }
    });

    if (!res.ok) throw new Error("Error fetching metadata");
    const data = (await res.json()) as unknown;

    const parsed = validateMetadata.parse(data, {
      errorMap: () => ({ message: "Error parsing metadata" }),
    });

    return validateMetadata.parse(data);
  } catch (error) {
    console.log("ERROR FETCHING METADATA");
    console.error(error);
  }
}
