"use client";
import { useQuery } from "@tanstack/react-query";
import { relative } from "path";
import { z } from "zod";

export type NoaaMetadata = {
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    cwa: string;
    forecastOffice: string;
    gridX: number;
    gridY: number;
    gridId: string;
    forecast: string;
    forecastHourly: string;
    forecastGridData: string;
    observationStations: string;
    relativeLocation: {
      type: string;
      properties: {
        city: string;
        state: string;
        distance: {
          value: number;
          unitCode: string;
        };
        bearing: {
          value: number;
          unitCode: string;
        };
      };
    };
    forecastZone: string;
    county: string;
    fireWeatherZone: string;
    timeZone: string;
    radarStation: string;
  };
};

const validator = z
  .object({
    properties: z.object({
      forecast: z.string(),
      forecastGridData: z.string(),
      forecastHourly: z.string(),
      forecastOffice: z.string(),
      relativeLocation: z.object({
        properties: z.object({
          city: z.string(),
          state: z.string(),
          distance: z.object({
            value: z.number(),
            unitCode: z.string(),
          }),
          bearing: z.object({
            value: z.number(),
            unitCode: z.string(),
          }),
        }),
      }),
      
    gridId: z.string(),
    }),
  })
  .passthrough();

export const useForecastMetadata = ({
  position: [lat, lon],
}: {
  position: [number, number];
}) => {
  const api = `https://api.weather.gov/points/${lat},${lon}`;

  const query = useQuery({
    queryKey: ["forecast-metadata", { lat, lon }],
    queryFn: async () => {
      try {
        const res = await fetch(api);
        const data = (await res.json()) as NoaaMetadata;

        return validator.parse(data);
      } catch (error) {
        throw new Error(`Failed to fetch forecast metadata for ${lat},${lon}`);
      }
    },
  });

  return query;
};
