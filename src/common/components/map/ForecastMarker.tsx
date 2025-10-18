"use client";
import { Popup, Marker } from "react-leaflet";
import * as L from "leaflet";
import React from "react";
import Geohash from "latlon-geohash";
import { useForecastMetadata } from "../hooks/noaa/useForecastMetadata";
import { useGridForecast } from "../hooks/noaa/useGridForecast";
import { useDailyForecast } from "../hooks/noaa/useDailyForecast";
import { UnitConverter } from "~/app/UnitConverter";
import { PopupContent } from "./PopupContent";
import { getSnowRangeString } from "./getSnowRangeString";
import { useSettings } from "./useSettings";

export const ForecastMarker = ({ hash }: { hash: string }) => {
  const coords = Geohash.decode(hash);

  const meta = useForecastMetadata({ position: [coords.lat, coords.lon] });

  const { units } = useSettings();

  // const forecast = useGridForecast(meta.data?.properties.forecastGridData, {
  //   lat: coords.lat,
  //   lon: coords.lon,
  // });

  const dailyForecast = useDailyForecast(meta.data?.properties.forecast, {
    lat: coords.lat,
    lon: coords.lon,
  });

  if (!dailyForecast.data)
    return (
      <Marker
        position={[coords.lat, coords.lon]}
        key={hash}
        icon={L.divIcon({
          className: "forecast-icon hover:z-marker-hover",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [15, -15],
          html: `<div class="bg-white/70 backdrop-blur-sm  animate-pulse relative text-primary w-fit py-2 px-1 mx-auto text-center rounded-full shadow-xl shadow-zinc-800/50  border-2 border-zinc-500  "> 
          <div class="text-2xs font-semibold min-w-12"> 
          <img src="/snowflake64.png" alt="Snowfall" class="inline-block -mb-1 size-4 -mb-2 animate-bounce "/>
          </div> 
      </div>`,
        })}
      />
    );

  // const elevationString =
  //   units === "metric"
  //     ? `${UnitConverter.metersToFeet(
  //         meta.data?.properties.elevation.value || 0
  //       ).toFixed(0)} ft`
  //     : `${meta.data?.properties.elevation.value?.toFixed(0)} m`;

  return (
    <Marker
      position={[coords.lat, coords.lon]}
      key={hash}
      riseOnHover={true}
      autoPanOnFocus={false}
      autoPan={false}
      icon={L.divIcon({
        className: "forecast-icon hover:z-marker-hover",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [15, -15],

        html: `<div class="bg-white/70 backdrop-blur-sm   relative text-primary w-fit py-2 px-1 mx-auto text-center rounded-full shadow-xl shadow-zinc-800/50  border-2 border-zinc-500  "> 
          <div class="text-2xs font-semibold min-w-12 text-nowrap px-1"> 
          <img src="/snowflake64.png" alt="Snowfall" class="inline-block mb-0.5 size-4  "/>
          ${getSnowRangeString(
            dailyForecast.data?.snowfall.min,
            dailyForecast.data?.snowfall.max,
            units
          ).replace(" ", "&nbsp;")} 
          </div> 
      </div>`,
      })}
    >
      <Popup
        className="relative hover:!z-[1000]"
        autoClose={false}
        autoPan={false}
        closeButton={false}
      >
        <PopupContent
          hash={hash}
          dailyForecast={dailyForecast}
          meta={meta}
          coords={coords}
        />
      </Popup>
    </Marker>
  );
};
