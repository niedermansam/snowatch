"use client";
import * as L from "leaflet";
import React, { useEffect } from "react";
import { useMap, TileLayer } from "react-leaflet";

export const MyTileLayer = ({
  tileLayer: tileLayer,
}: {
  tileLayer: {
    url: string;
    attribution: string;
  };
}) => {
  const map = useMap();

  useEffect(() => {
    map.eachLayer((layer) => {
      map.removeLayer(layer);
    });
    map.addLayer(
      L.tileLayer(tileLayer.url, {
        attribution: tileLayer.attribution,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tileLayer]);

  return (
    <TileLayer
      url={tileLayer.url}
      attribution={tileLayer.attribution}
      key={tileLayer.url}
    />
  );
};
