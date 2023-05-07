"use client";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import { useRouter, useSearchParams } from "next/navigation";
import Geohash from "latlon-geohash";
import { useState } from "react";
type ContainerProps = Parameters<typeof MapContainer>[0];

function ClickHandler({setCenter}: {setCenter: (center: [number, number]) => void}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const elevation = searchParams?.get("elev");

  const map = useMap();

  useMapEvents({
    click(e) {
      const geohash = Geohash.encode(e.latlng.lat, e.latlng.lng, 5);
      const elevationString = elevation ? `?elev=${elevation}` : "";
      
      map.panTo([e.latlng.lat, e.latlng.lng]);

     // setCenter([e.latlng.lat, e.latlng.lng]);

       setTimeout(() => router.replace(`/snotel/near/${geohash}` + elevationString), 20) ;
    },
  });
  return null;
}

interface CustomContainerProps extends ContainerProps {
  center: [number, number];
  zoom: number;
}

type MapProps = {
  containerProps: CustomContainerProps;
  children?: React.ReactNode[];
};

export default function BaseMap({ containerProps, children }: MapProps) {
  const [center, setCenter] = useState(containerProps.center);
  const [zoom] = useState(containerProps.zoom);
  return (
    <MapContainer
      style={{
        height: "300px",
        width: "100vw",
      }}
      zoomAnimation={true}
      {...containerProps}
      center={center}
      zoom={zoom}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler setCenter={setCenter} />
      <Marker position={center}>
        <Popup>
          Current Location
        </Popup>
      </Marker>
      {children}
    </MapContainer>
  );
}
