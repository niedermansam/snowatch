"use client";

import React from "react";
import { MapContainer} from "react-leaflet";
import TileComponent from "./components/TileSelector";
import Geohash from "latlon-geohash";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import { useRouter, useSearchParams } from "next/navigation";
import { ForecastMarker } from "./components/ForecastMarker";
import { ClickHandler } from "./ClickHandler";
import { MoveHandler } from "./MoveHandler";

import { DESKTOP_NAVBAR_HEIGHT } from "~/common/components/NavBar";
export const GEOHASH_PRECISION = 8;

export const createUrl = ({
  center,
  zoom,
  locations,
  currentPath = "",
}: {
  center?: string;
  zoom?: number;
  locations?: string[];
  currentPath?: string;
} = {}) => {
  const params = new URLSearchParams();
  if (center) params.set("center", center);
  if (locations && locations.length > 0) params.set("locations", locations.join(","));
  if (zoom) params.set("zoom", zoom.toString());
  return `${currentPath}?${params.toString()}`;
};

function ForecastMap() {
  const query = useSearchParams();
  const router = useRouter();

  const center = Geohash.decode(
    query.get("center") || Geohash.encode(44, -114, GEOHASH_PRECISION)
  );
  const locations = query.get("locations");

  const setForecasts = (forecastLocations: string[]) => {
    const centerGeoHash = query.get("center") || undefined;
    const zoomString = query.get("zoom");
    const zoom = zoomString ? parseInt(zoomString) : undefined;

    router.replace(
      createUrl({
        locations: forecastLocations,
        center: centerGeoHash,
        zoom: zoom,
      })
    );
  };

  return (
    <MapContainer
      className=" w-full"
      style={{
        height: `calc(100dvh - ${DESKTOP_NAVBAR_HEIGHT}px)`,
      }}
      center={[center.lat, center.lon]}
      zoom={7}
      closePopupOnClick={false}
    >
      <TileComponent selectedTile="esriWorldTopoMap" />

      {locations?.split(",").map((forecastLocation) => {
        if(!forecastLocation) return;
        const { lat, lon } = Geohash.decode(forecastLocation);
        return <ForecastMarker lat={lat} lng={lon} key={forecastLocation} />;
      })}
      <ClickHandler
        forecastLocations={locations?.split(",") || []}
        setForecasts={setForecasts}
      />
      <MoveHandler />
    </MapContainer>
  );
}

export default ForecastMap;
