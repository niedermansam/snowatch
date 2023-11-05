"use client";
import React from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import Geohash from "latlon-geohash";
import useForecast, { Forecast } from "~/modules/forecast/hooks/useForecast";
import { METERS_TO_FEET } from "~/common/utils/units";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GEOHASH_PRECISION, createUrl } from "./ForecastMap";
import ReactModal from "react-modal";

function ForecastModal({
  forecastData
} :
{
  forecastData: Forecast
} ) {
  const [isOpen, setIsOpen] = React.useState(false);

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      width: '50%',
      height: '50%',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
    overlay: {
      zIndex: 11150,

    }
  }

   if(forecastData.isLoading) return null
    if(forecastData.isError) return null

    const windiestPeriod = forecastData.wind.getWindiestPeriod()

    
    return (
      <>
        <button className=" rounded border border-solid  border-sw-indigo-300 bg-sw-indigo-50 px-1 text-xs text-sw-indigo-400 hover:bg-sw-indigo-400 hover:text-white"
          onClick={() => setIsOpen(true)}
        >
          details
        </button>
        <ReactModal 
        style={customStyles}
        isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
          {forecastData.snow.total} expected at {forecastData.elevation || 0 * METERS_TO_FEET} meters
          <div>{windiestPeriod.gusts ? "Gusts" : "Winds"} up to {windiestPeriod.gusts || windiestPeriod.high} mph on {windiestPeriod.period}</div>
        </ReactModal>
      </>
    );
}

function RemoveMarkerButton({ onClick }: { onClick: () => void }) {
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
        <Popup autoPan={false} autoClose={false} ref={popupRef}>
          Loading...
          <RemoveMarkerButton onClick={handleClose} />
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


  const elevationString = forecast.elevation
    ? `at ${Math.round(forecast.elevation * METERS_TO_FEET)} ft`
    : null;

  return (
    <Marker position={[lat, lng]} ref={markerRef} autoPan={false} riseOnHover={true} riseOffset={100} eventHandlers={{
      click: (e) => {
        console.log(e)
      }
    }}>
      <Popup autoPan={false} autoClose={false} eventHandlers={{
        click: (e) => {
          console.log(e)
        }
      }} >
        <div className="hover:z-[10000] -m-1 text-xs">
         <span> {forecast.snow.total}</span> &nbsp;
        <span className="font-light">{elevationString}</span> 
        <div className="w-full flex justify-between gap-x-3 pt-1">
          <ForecastModal  forecastData={forecast}/>
          <RemoveMarkerButton onClick={handleClose} />
        </div>
        </div>
      </Popup>
    </Marker>
  );
}
