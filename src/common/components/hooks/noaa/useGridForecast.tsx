"use client";
import { useQuery } from "@tanstack/react-query";


type PointDataFeature = {
  uom: string;
  values: PointDataValue[];
};

export type PointDataValue = {
  validTime: string;
  value: number;
};

export type GridPointData = {
  id: string;
  type: string;
  updatedTime: string;
  validTimes: string;
  elevation: {
    value: number;
    unitCode: string;
  };
  gridId: string;
  gridX: number;
  gridY: number;
  temperature: PointDataFeature;
  dewpoint: PointDataFeature;
  maxTemperature: PointDataFeature;
  minTemperature: PointDataFeature;
  relativeHumidity: PointDataFeature;
  apparentTemperature: PointDataFeature;
  heatIndex: PointDataFeature;
  windChill: PointDataFeature;
  skyCover: PointDataFeature;
  windDirection: PointDataFeature;
  windSpeed: PointDataFeature;
  windGust: PointDataFeature;
  weather: PointDataFeature;
  probabilityOfPrecipitation: PointDataFeature;
  quantitivePrecipitation: PointDataFeature;
  iceAccumulation: PointDataFeature;
  snowfallAmount: PointDataFeature;
  snowLevel: PointDataFeature;
  visibility: PointDataFeature;
  ceilingHeight: PointDataFeature;
  transportWindDirection: PointDataFeature;
  transportWindSpeed: PointDataFeature;
  mixingHeight: PointDataFeature;
  ventilationRate: PointDataFeature;
  humidity: PointDataFeature;
  lightningActivityLevel: PointDataFeature;
  twentyFootWindSpeed: PointDataFeature;
  twentyFootWindDirection: PointDataFeature;
};

export const useGridForecast = (
  url: string | undefined,
  position: { lat: number; lon: number },
) => {
  const query = useQuery({
    queryKey: ["forecast-grid", position],
    enabled: !!url,
    queryFn: async () => {
      if (!url) return;
      const res = await fetch(url);
      return (await res.json()) as { properties: GridPointData };
    },
  });

  return query;
};
