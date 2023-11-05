"use client";
import { useMapEvents } from "react-leaflet";
import Geohash from "latlon-geohash";
import { useRouter, useSearchParams } from "next/navigation";
import { createUrl } from "./ForecastMap";

const MAX_LOCATIONS = 5;

export function ClickHandler({
  forecastLocations,
  setForecasts,
}: {
  forecastLocations: string[];
  setForecasts: (forecastLocations: string[]) => void;
}) {
  const router = useRouter();

  const query = useSearchParams();



  useMapEvents({
    click: (e) => {
      const newLocation = Geohash.encode(e.latlng.lat, e.latlng.lng, 8);

      const newLocationArray = [newLocation, ...forecastLocations];

      while (newLocationArray.length > MAX_LOCATIONS) {
        newLocationArray.pop();
      }

      const center = query.get("center") || undefined;
      const zoomString = query.get("zoom");
      const zoom = zoomString ? parseInt(zoomString) : undefined;


      setForecasts( newLocationArray);
      router.replace(
        createUrl({ locations: newLocationArray, center, zoom})
      );
    },
  });

  return null;
}
