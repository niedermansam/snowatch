"use client";
import { useMapEvents } from "react-leaflet";
import Geohash from "latlon-geohash";
import { useRouter, useSearchParams } from "next/navigation";
import { createUrl } from "./ForecastMap";
import { useMapStore, useMapUrl } from "../forecast/forecastStore";
import { sendGAEvent } from "@next/third-parties/google";

const MAX_LOCATIONS = 5;

export function ClickHandler({
  forecastLocations,
}: {
  forecastLocations: string[];
  setForecasts: (forecastLocations: string[]) => void;
}) {
  const router = useRouter();
  const mapStore = useMapStore();

  const urlHander = useMapUrl();

  const query = useSearchParams();

  useMapEvents({
    click: (e) => {
      const newLocation = Geohash.encode(e.latlng.lat, e.latlng.lng, 8);
      const newLocationArray = [newLocation, ...forecastLocations];

      while (newLocationArray.length > MAX_LOCATIONS) {
        newLocationArray.pop();
      }

      sendGAEvent({
        event: 'forecast_request',
        value: newLocation,
      });

      const center = query.get("center") || undefined;
      const zoomString = query.get("zoom");
      const zoom = zoomString ? parseInt(zoomString) : undefined;
       mapStore.forecastDispatch({
        type: "ADD",
        payload: newLocation,
      });

    },
  });

  return null;
}
