"use client";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

type ContainerProps = Parameters<typeof MapContainer>[0]


export function BaseMap({containerProps}: {containerProps: ContainerProps}){
    
    return (
      <MapContainer style={{
        height: "300px",
        width: "500px"
      }} {...containerProps}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    );
    }


