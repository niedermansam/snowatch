import { useQuery } from "@tanstack/react-query";
import { getSnotelData } from "../server/getSnotelData";
import type { SnotelMetadata, snotelMetadata } from "../types";
import { getNearestSnotel } from "../server/getNearestSnotel";


export function Snotel(
    metadata:  SnotelMetadata
) {

    const monthData = useQuery(['snotel', metadata.id, 'month'], () => getSnotelData(metadata.id, 'daily'), {
        staleTime: 1000 * 60 * 15,

    } );

    return {
        ...monthData,
        ...metadata,
        getSnowDepths: () => monthData.data?.map(d => d.snow.depth),
        getSnowChanges: () => monthData.data?.map(d => d.snow.change),
        getSnowDensities: () => monthData.data?.map(d => d.snow.density),
        getTempAvgerages: () => monthData.data?.map(d => d.temp.avg),
        getMinTemps: () => monthData.data?.map(d => d.temp.min),
        getMaxTemps: () => monthData.data?.map(d => d.temp.max),

        getSWEs: () => monthData.data?.map(d => d.swe.value),
        getSWEChanges: () => monthData.data?.map(d => d.swe.change),
        getDates: () => monthData.data?.map(d =>  d.date?.toLocaleDateString()),

    }

}

export function useNearbySnotel({geohash, n = 3, enabled=true}: {geohash: string, n?: number, enabled?: boolean }) {

    const nearbySnotel = useQuery(['nearbySnotel', geohash, n], () => getNearestSnotel(geohash, n), {
        staleTime: Infinity,
        enabled: enabled
    });


    return nearbySnotel;

}