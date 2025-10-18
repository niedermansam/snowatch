"use client";
import { useState } from "react";
import Geohash from "latlon-geohash";
import { useForecastList } from "~/common/components/hooks/noaa/useForecastList";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { MISSOULA_COORDS } from "./MainMap";
import { type TileLayerProps, baseMaps } from "./TileLayerProps";

export const useMapState = () => {
  const { forecasts, setForecasts, addForecast, removeForecast } =
    useForecastList();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [tileLayer, setTileLayer] = useState<TileLayerProps>(baseMaps[0]!);

  const [zoom, setZoom] = useQueryState("zoom", parseAsInteger.withDefault(13));

  // geohash of center
  const [center, setCenter] = useQueryState("center", parseAsString);

  const coords = center ? Geohash.decode(center) : MISSOULA_COORDS;

  return {
    zoom,
    setZoom,
    center: coords as [number, number],
    setCenter,
    forecasts,
    setForecasts,
    addForecast,
    removeForecast,
    tileLayer,
    setTileLayer,
  };
};
