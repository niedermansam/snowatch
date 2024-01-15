import { useQueries, useQuery } from "@tanstack/react-query";
import { getSnotelCSVData } from "../server/getSnotelData";
import type { SnotelMetadata } from "../types";
import { getNearestSnotel } from "../server/getNearestSnotel";
import { useCallback, useMemo } from "react";

export function Snotel(metadata: SnotelMetadata) {
  const monthData = useQuery(
    ["snotel", metadata.id, "month"],
    () => getSnotelCSVData(metadata.id, "daily"),
    {
      staleTime: 1000 * 60 * 15,
    }
  );

  return {
    ...monthData,
    ...metadata,
    getSnowDepths: () => monthData.data?.data.map((d) => d.snow.depth),
    getSnowChanges: () => monthData.data?.data.map((d) => d.snow.change),
    getSnowDensities: () => monthData.data?.data.map((d) => d.snow.density),
    getTempAvgerages: () => monthData.data?.data.map((d) => d.temp.avg),
    getMinTemps: () => monthData.data?.data.map((d) => d.temp.min),
    getMaxTemps: () => monthData.data?.data.map((d) => d.temp.max),

    getSWEs: () => monthData.data?.data.map((d) => d.swe.value),
    getSWEChanges: () => monthData.data?.data.map((d) => d.swe.change),
    getDates: () =>
      monthData.data?.data.map((d) => d.date?.toLocaleDateString()),
  };
}

export function useNearbySnotel({
  geohash,
  n = 3,
  enabled = true,
}: {
  geohash: string;
  n?: number;
  enabled?: boolean;
}) {
  const nearbySnotel = useQuery(
    ["nearbySnotel", geohash, n],
    () => getNearestSnotel(geohash, n),
    {
      staleTime: Infinity,
      enabled: enabled,
    }
  );

  const nearbySnotelData = useQueries({
    queries:
      nearbySnotel.data?.map((snotel) => {
        return {
          queryKey: ["snotel", snotel.id],
          queryFn: () => getSnotelCSVData(snotel.id, "daily"),
          staleTime: Infinity,
          enabled: nearbySnotel.isSuccess,
        };
      }) || [],
  });

  const combinedData = useCallback(() => {
    return {
      ...nearbySnotel,
      data: nearbySnotelData.map((snotelData, i) => {
        return {
          ...snotelData,
          data: {
            ...snotelData.data,
            ...nearbySnotel.data?.[i],
          },
        };
      }),
    };
  }, [nearbySnotelData, nearbySnotel.data]);

  return combinedData();
}

export type NearbySnotel = ReturnType<typeof useNearbySnotel>["data"][number];
