"use client";
import { useMapEvents } from "react-leaflet";
import Geohash from "latlon-geohash";
import { useRouter, useSearchParams } from "next/navigation";
import { GEOHASH_PRECISION, createUrl } from "./ForecastMap";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useMapStore } from "../forecast/forecastStore";

export function MoveHandler() {
  const router = useRouter();
  const query = useSearchParams();
  const loadingQueries = useIsFetching();
  const mapStore = useMapStore();
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const centerGeoHash = Geohash.encode(
        center.lat,
        center.lng,
        GEOHASH_PRECISION
      ); 
      

      
      
      if(loadingQueries === 0) router.replace(
        createUrl({
          center: centerGeoHash,
          zoom,
          locations: mapStore.forecasts
        })
      );
    },
  });
  return null;
}
