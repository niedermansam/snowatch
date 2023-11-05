"use client";
import Geohash from "latlon-geohash";
import type { Map } from "leaflet";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { DESKTOP_NAVBAR_HEIGHT } from "~/common/components/NavBar";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import Forecast from "../forecast"; 
import { forecast } from "../forecast/test-data";

const getMapUrl = (map: Map, forecastLocations: string[]) => {

  type QueryStrings = {
    center: string,
    zoom: string,
    forecastLocations?: string,
  }

  let queryStrings:QueryStrings = {
    center: Geohash.encode(map.getCenter().lat, map.getCenter().lng, 8),
    zoom: map.getZoom().toString(),
  }

  if (forecastLocations.length > 0) {
    queryStrings = {...queryStrings, forecastLocations: forecastLocations.join(",")}
  }

  const newPath = new URLSearchParams( queryStrings)

  return `/map?${newPath.toString()}`
}

const useViewChange = (map: Map, forecastLocations: string[]) => {
  const router = useRouter()
  router.replace(getMapUrl(map, forecastLocations))
}

const useNewMarker = (map: Map, forecastLocations: string[]) => {
  const router = useRouter()
  router.push(getMapUrl(map, forecastLocations))
}

function UrlHandler({forecastLocations}: {forecastLocations: string[]}) {
  const map = useMapEvents(
    {
      zoomend: () => {
        function useZoomChange(map: Map,  forecastLocations: string[]) {
  const router = useRouter();

          router.replace(getMapUrl(map, forecastLocations))
        }

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useZoomChange(map, forecastLocations)
      },
      moveend: () => {
        function useMoveChange(map: Map,  forecastLocations: string[]) {
          const router = useRouter();
          router.replace(getMapUrl(map, forecastLocations))
        }

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useMoveChange(map, forecastLocations)
      },


    }
  )

  return null
}

function ForecastMarker({lat, lng}: {lat: number, lng: number}) {

  const forecast = new Forecast(lat, lng )

  const [forecastData, setForecastData] = React.useState<Forecast | null | undefined>(null)
  
  useEffect( () => {

    async function fetchData() {
      const myForecast = await forecast.getForecast()
      setForecastData(forecast)
    }


  }, [])

  return (
    <Marker position={[lat, lng]}>
      <Popup>
        {forecastData?.forecast?.elevation.ft}
      </Popup>
    </Marker>
  )
}

function HandleClickEvent({forecastLocations}: {forecastLocations: string[]}) {
  const [markers, setMarkers] = React.useState<JSX.Element[]>([])
  const router = useRouter()
  const map = useMapEvents(
    {
      click: (e) => {
        const newMarker = <ForecastMarker lat={e.latlng.lat} lng={e.latlng.lng} key={e.latlng.toString()} />

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useNewMarker(map,  [...forecastLocations, Geohash.encode(e.latlng.lat, e.latlng.lng, 6) ])
      }
    }
  )

  return (
    <>
      {markers}
    </>
  )
}

function FullPageMap({
  center,
  zoom,
  forecastLocations,
}: {
  center: [number, number];
  zoom: number;
  forecastLocations: string[];
}) {
  return (
    <MapContainer
      className=" w-full"
      style={{
        height: `calc(100dvh - ${DESKTOP_NAVBAR_HEIGHT}px)`,
      }}
      center={center}
      zoom={zoom}
    >
      <TileLayer
      maxZoom={17}
        attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      />

      {forecastLocations.map((forecastLocation) => {
        const { lat, lon } = Geohash.decode(forecastLocation);
        return <ForecastMarker lat={lat} lng={lon} key={forecastLocation} />;
      })}
      <UrlHandler forecastLocations={forecastLocations} />
      <HandleClickEvent forecastLocations={forecastLocations} />
    </MapContainer>
  );
}

export default FullPageMap;
