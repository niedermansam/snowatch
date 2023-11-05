import Geohash from "latlon-geohash";
import {type NextRequest, NextResponse } from "next/server";
import { FEET_TO_METERS } from "~/common/utils/units";
import { db } from "~/server/db";


export async function GET(req: NextRequest) {

    const lat = req.nextUrl.searchParams.get('lat') || req.geo?.latitude
    const lon = req.nextUrl.searchParams.get('lon') || req.geo?.longitude
    const n = parseInt(req.nextUrl.searchParams.get('n') ||'10') 
    const minElevation = parseInt( req.nextUrl.searchParams.get('minElevation') || '0') 

    
    type Snotel = {
        id: string;
        name: string;
        elevation: number;
        lat: number;
        lon: number;
        state: string;
        distance: number;
        bearing: number;
    }

    const data = await db.$queryRaw<{data: Snotel[] }>`
SELECT id, name, elevation, lat, lon, state,
ROUND((coords::geography <-> ST_SetSRID(ST_MakePoint( ${lon}::double precision, ${lat}::double precision ),4326)::geography)::double precision / 52.8) /100 AS distance,
ROUND(ST_Azimuth( ST_SetSRID(ST_MakePoint( ${lon}::double precision, ${lat}::double precision ),4326)::geography, coords::geography )/(2*pi())*360) AS bearing
FROM snotel WHERE elevation > ${FEET_TO_METERS * minElevation}
ORDER BY dist LIMIT ${n};
    `;

// const data = "hello"

  return  NextResponse.json({data, query: {lat, lon, n, minElevation}});
}