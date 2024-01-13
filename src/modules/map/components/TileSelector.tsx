import React from "react";
import { TileLayer, useMap } from "react-leaflet"; 

type OptionKeys = keyof typeof tileLayers
 

export const TILE_OPTIONS: Record<OptionKeys, string> = {
    openTopoMap: "OpenTopoMap",
    openStreetMap: "OpenStreetMap",
    esriWorldImagery: "Esri World Imagery",
    esriWorldTopoMap: "Esri World Topo Map",

} as const;

const tileLayers = {
  openTopoMap: (
    <TileLayer
      url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      attribution='Map data: &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      maxZoom={17}
    />
  ),
  openStreetMap: (
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='Map data: &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      maxZoom={19}
    />
  ),
  esriWorldImagery: (
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
      maxZoom={19}
    />
  ),
  esriWorldTopoMap: (
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
      attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community"
      maxZoom={19} 
    />
  ),
} as const;


export const modalTileLayers = {
  openTopoMap: (
    <TileLayer
      url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      maxZoom={17}
    />
  ),
  openStreetMap: (
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      maxZoom={19}
    />
  ),
  esriWorldImagery: (
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      maxZoom={19}
    />
  ),
  esriWorldTopoMap: (
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
      maxZoom={19}
    />
  ),
} as const;

function TileComponent({
    selectedTile,
    }: {
    selectedTile: keyof typeof tileLayers;
}) {

    
  return  (
    tileLayers[selectedTile]
  )
}

export function ModalTileComponent({
  selectedTile,
  }: {
  selectedTile: keyof typeof modalTileLayers;
}) {
    return modalTileLayers[selectedTile]
}


export default TileComponent;
