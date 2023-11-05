"use client";
import React from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import Geohash from "latlon-geohash";
import useForecast from "~/common/hooks/useForecast";
import { METERS_TO_FEET } from "~/common/utils/units";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GEOHASH_PRECISION, createUrl } from "./ForecastMap";

export function ForecastMarker({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  const forecast = useForecast({ lat, lng });
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPath = usePathname();

  const markerRef = React.useRef<L.Marker>(null);

  const handleClose = () => {
    const locations = searchParams.get("locations")?.split(",") || [];

    const newLocations = locations.filter(
      (location) => location !== Geohash.encode(lat, lng, GEOHASH_PRECISION)
    );

    const center = searchParams.get("center") || undefined;
    const zoomString = searchParams.get("zoom");
    const zoom = zoomString ? parseInt(zoomString) : undefined;

    const url = createUrl({
      locations: newLocations,
      center,
      zoom,
      currentPath,
    });
    router.replace(url);
  };

  const isInBounds = map.getBounds().contains([lat, lng]);

  React.useEffect(() => {
    if (isInBounds) {
      markerRef.current?.openPopup();
    } else {
      markerRef.current?.closePopup();
    }
  }
  , [isInBounds]);
  

  

  if (forecast.isLoading)
    return (
      <Marker position={[lat, lng]} ref={markerRef} autoPan={false}>
        <Popup autoPan={false} autoClose={false}>
          Loading...
        </Popup>
      </Marker>
    );

  if (forecast.isError)
    return (
      <Marker position={[lat, lng]} ref={markerRef} autoPan={false}>
        <Popup autoPan={false} autoClose={false}>
          Error loading forecast
        </Popup>
      </Marker>
    );

  const elevationString = forecast.elevation
    ? `${Math.round(forecast.elevation * METERS_TO_FEET)} ft`
    : null;

  return (
    <Marker position={[lat, lng]} ref={markerRef} autoPan={false}>
      <Popup autoPan={false} autoClose={false}>
        <div className="hover:z-50">
          {forecast.snow.total}
          <br />
          {elevationString}
        </div>
        <button onClick={handleClose}>X</button>
      </Popup>
    </Marker>
  );
}
