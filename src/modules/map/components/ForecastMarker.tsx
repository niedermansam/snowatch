"use client";
import React from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import Geohash from "latlon-geohash";
import useForecast from "~/modules/forecast/hooks/useForecast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GEOHASH_PRECISION, createUrl } from "../ForecastMap";
import { ForecastModal } from "../ForecastModal";
import { useMapStore } from "~/modules/forecast/forecastStore";

function RemoveMarkerButton({ onClick }: { onClick:React.MouseEventHandler<HTMLButtonElement>  }) {
  return (
    <button
      className=" rounded border border-solid border-sw-red-400 bg-sw-red-50 px-1 text-xs text-sw-red-400 hover:bg-sw-red-400 hover:text-white"
      onClick={onClick}
    >
      remove
    </button>
  );
}

export function ForecastMarker({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const forecastStore = useMapStore();

  const forecast = useForecast({ lat, lng });
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPath = usePathname();

  const markerRef = React.useRef<L.Marker>(null);
  const popupRef = React.useRef<L.Popup>(null);

  const handleClose = () => {
    const locations = searchParams.get("locations")?.split(",") || [];

    const newLocations = locations.filter(
      (location) => location !== Geohash.encode(lat, lng, GEOHASH_PRECISION)
    );

    const center = searchParams.get("center") || undefined;
    const zoomString = searchParams.get("zoom");
    const zoom = zoomString ? parseInt(zoomString) : undefined;

    // const url = createUrl({
    //   locations: newLocations,
    //   center,
    //   zoom,
    //   currentPath,
    // });
    // router.replace(url);

    // forecastStore.setForecasts(newLocations);
    forecastStore.forecastDispatch({
      type: "REMOVE",
      payload: Geohash.encode(lat, lng, GEOHASH_PRECISION),
    });
  };

  const isInBounds = map.getBounds().contains([lat, lng]);

  React.useEffect(() => {
    if (isInBounds) {
      markerRef.current?.openPopup();
    } else {
      markerRef.current?.closePopup();
    }
  }, [isInBounds]);

  if (forecast.isLoading)
    return (
      <Marker position={[lat, lng]} ref={markerRef} autoPan={false}>
        <Popup autoPan={false} autoClose={false} ref={popupRef}>
          Loading...
          <RemoveMarkerButton onClick={
            (e) => { 
                e.preventDefault();
                e.stopPropagation();
                handleClose();
            }
          } />
        </Popup>
      </Marker>
    );

  if (forecast.isError)
    return (
      <Marker position={[lat, lng]} ref={markerRef} autoPan={false}>
        <Popup autoPan={false} autoClose={false}>
          Error loading forecast
          <RemoveMarkerButton onClick={handleClose} />
        </Popup>
      </Marker>
    );

  const elevation = forecast.data?.getElevation("F");

  const elevationString =
    elevation && forecast.data?.elevation ? `at ${elevation} ft` : null;

  return (
    <Marker
      position={[lat, lng]}
      ref={markerRef}
      autoPan={false}
      riseOnHover={true}
      riseOffset={100}
      eventHandlers={{
        click: (e) => {
          console.log(e);
        },
      }}
    >
      <Popup
        autoPan={false}
        autoClose={false}
        eventHandlers={{
          click: (e) => {
            console.log(e);
          },
        }}
      >
        <div className="-m-1 text-xs hover:z-[10000]">
          <span> {forecast.data?.snow.total}</span> &nbsp;
          <span className="font-light">{elevationString}</span>
          <div className="flex w-full justify-between gap-x-3 pt-1">
            <ForecastModal forecastData={forecast} />
            <RemoveMarkerButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
              }}
            />
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
