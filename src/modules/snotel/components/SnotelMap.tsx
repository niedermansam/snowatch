"use client";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import { useRouter, useSearchParams } from "next/navigation";
import Geohash from "latlon-geohash";
type ContainerProps = Parameters<typeof MapContainer>[0];

function ClickHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const elevation = searchParams?.get("elev");

  useMapEvents({
    click(e) {
      const geohash = Geohash.encode(e.latlng.lat, e.latlng.lng, 5);
      const elevationString = elevation ? `?elev=${elevation}` : "";
      router.push(
        `/snotel/near/${geohash}` + elevationString
      );
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
  return (
    <MapContainer
      style={{
        height: "300px",
        width: "100vw",
      }}
      zoomAnimation={true}
      {...containerProps}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler />
      <Marker position={containerProps.center}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
      {children}
    </MapContainer>
  );
}
