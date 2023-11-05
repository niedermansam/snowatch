"use client";
import { useMapEvents } from "react-leaflet";
import Geohash from "latlon-geohash";
import { useRouter } from "next/navigation";
import { createUrl } from "./ForecastMap";

export function ClickHandler({
  forecastLocations,
  setForecasts,
}: {
  forecastLocations: string[];
  setForecasts: (forecastLocations: string[]) => void;
}) {
  const router = useRouter();
  useMapEvents({
    click: (e) => {
      const newLocation = Geohash.encode(e.latlng.lat, e.latlng.lng, 8);
      setForecasts([...forecastLocations, newLocation]);
      router.replace(
        createUrl({ locations: [...forecastLocations, newLocation] })
      );
    },
  });

  return null;
}
