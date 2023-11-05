"use client";
import { useMapEvents } from "react-leaflet";
import Geohash from "latlon-geohash";
import { useRouter, useSearchParams } from "next/navigation";
import { GEOHASH_PRECISION, createUrl } from "./ForecastMap";

export function MoveHandler() {
  const router = useRouter();
  const query = useSearchParams();
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const centerGeoHash = Geohash.encode(
        center.lat,
        center.lng,
        GEOHASH_PRECISION
      );
      const locations = query.get("locations") || undefined;
      router.replace(
        createUrl({
          center: centerGeoHash,
          zoom,
          locations: locations?.split(",") || undefined,
        })
      );
    },
  });
  return null;
}
