"use client";

import React from "react";
import { MapContainer, Marker } from "react-leaflet";
import TileComponent, { ModalTileComponent } from "./components/TileSelector";
import Geohash from "latlon-geohash";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";


function ModalMap({geohash, className}: {geohash: string, className?: string}) {

    const {lat, lon} = Geohash.decode(geohash);

  return (
    <MapContainer
      className={className}
      center={[lat, lon]}
      zoom={9}
      closePopupOnClick={false}
      style={{
        height: '100%',
        width: '100%',
        zIndex: 13000,
      }}
      zoomControl={false}
    >
      <ModalTileComponent selectedTile="esriWorldTopoMap" />

      <Marker position={[lat, lon]}>

      </Marker>


    </MapContainer>
  );
}

export default ModalMap