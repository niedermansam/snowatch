"use client";
import { MapContainer, useMapEvents } from "react-leaflet";
// import leaflet css
import "leaflet/dist/leaflet.css";
import React, { Suspense, useEffect, useRef } from "react";
import Geohash from "latlon-geohash";
import { NewForecastMarker } from "./ForecastMarker";
import { useMapState } from "./useMapState";
import { MyTileLayer } from "./MyTileLayer";
import { EventHandler } from "./event-handler";
import { MoveHandler } from "~/modules/map/MoveHandler";
import { ClickHandler } from "~/modules/map/ClickHandler";
export const MISSOULA_COORDS = [46.8721, -113.994];



const MainMap = () => {
  // const formattedData = getDailyForecastFromGridPointData(data.properties);

  const { forecasts, setForecasts, zoom, center, tileLayer } = useMapState();
  const [render, setRender] = React.useState(true);

  // rerender map when the tile layer changes
  useEffect(() => {
    setRender(false);
    setTimeout(() => setRender(true), 1000);
  }, [tileLayer]);

  if (typeof window === "undefined") {
    return <></>;
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      closePopupOnClick={false}
    >
      <MyTileLayer tileLayer={tileLayer} />
      {/* <TileLayer
        url={`https://tile.openweathermap.org/map/snow_new/{z}/{x}/{y}.png?appid=${env.NEXT_PUBLIC_OWM_API_KEY}`}
        attribution='Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>'
        opacity={0.9}
      /> */}
      {forecasts?.map((hash) => (
        <NewForecastMarker key={hash} hash={hash} />
      ))}
      <EventHandler forecasts={forecasts} setForecast={setForecasts} />  
    </MapContainer>
  );
};

export default MainMap;
