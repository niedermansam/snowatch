"use client";
import React, { use } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import Geohash from "latlon-geohash";
import useForecast from "~/modules/forecast/hooks/useForecast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GEOHASH_PRECISION, createUrl } from "../ForecastMap";
import { ForecastModal } from "../ForecastModal";
import { useMapStore } from "~/modules/forecast/forecastStore";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SnowIcon } from "~/app/test/SnowIcon";
import { AlertTriangle } from "lucide-react";
import { ReloadIcon } from "@radix-ui/react-icons";

function RemoveMarkerButton({
  onClick,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <Button
      // className=" rounded border border-solid border-sw-red-400 bg-sw-red-50 px-1 text-xs text-sw-red-400 hover:bg-sw-red-400 hover:text-white"
      size="xs"
      variant={"destructive-outline"}
      onClick={onClick}
    >
      remove
    </Button>
  );
}

export function ForecastMarker({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const forecastStore = useMapStore();
  const queryClient = useQueryClient();

  const forecast = useForecast({ lat, lng });
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPath = usePathname();
  const queriesLoading = useIsFetching();

  const markerRef = React.useRef<L.Marker>(null);
  const popupRef = React.useRef<L.Popup>(null);

  const removeForecast = () => {
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

  const resetQuery = () => {
    forecast.remove();
    forecast.refetch().catch((e) => {
      console.error(e);
    });
  };

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
        <Popup
          autoPan={false}
          autoClose={false}
          ref={popupRef}
          eventHandlers={{
            mouseover: (e) => {
              console.log(e);
            },
          }}
        >
          <div
            onMouseOver={(e) => {
              console.log(e);
            }}
            className="  -m-1 grid w-32   grid-cols-2 place-items-center gap-x-6"
          >
            <span
              className="my-0! col-span-2 flex w-full animate-pulse items-end gap-x-1 pb-2 text-xs font-bold text-slate-400"
              style={{ margin: 0 }}
            >
              <SnowIcon />
              Loading&nbsp;Forecast
            </span>
            <Button
              size="xs"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resetQuery();
              }}
            >
              <ReloadIcon
                className="size-3 mr-1 stroke-[4]"
                strokeWidth={2.75}
              />{" "}
              reload
            </Button>
            <RemoveMarkerButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeForecast();
              }}
            />
          </div>
        </Popup>
      </Marker>
    );

  if (forecast.isError || !forecast.data)
    return (
      <Marker position={[lat, lng]} ref={markerRef} autoPan={false}>
        <Popup autoPan={false} autoClose={false}>
          <div className="flex flex-col">
            <span className="flex items-end gap-x-1 pb-1 text-xs font-bold text-sw-red-600">
              <AlertTriangle className="size-4 mb-0.5" /> Error loading forecast
            </span>
            <div className="flex justify-between">
              <Button
                size="xs"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  resetQuery();
                }}
              >
                reload
              </Button>
              <RemoveMarkerButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeForecast();
                }}
              />
            </div>
          </div>
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
                removeForecast();
              }}
            />
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
