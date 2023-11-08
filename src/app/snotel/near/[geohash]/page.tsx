import Link from "next/link";
import type { QueryResultRow } from "pg";
import dynamic from "next/dynamic";
import { db } from "~/server/db";

const Map = dynamic(() => import("~/modules/snotel/components/SnotelMap"), {
  ssr: false,
});

import {
  FEET_TO_METERS,
  METERS_TO_FEET,
  METERS_TO_MILES,
} from "~/common/utils/units";
import Geohash from "latlon-geohash";
import { Snotel } from "~/modules/snotel/data";
import {
  SnotelSnowGraphWithoutAxis,
  SnotelTemperatureGraphWithoutAxis,
} from "~/modules/snotel/components/SnotelGraph";
import { ElevationSelector } from "~/modules/snotel/components/ElevationSelector";
import { Suspense } from "react";
import { translateBearing } from "../../../../common/utils/translateBearing";

interface SnotelDistance extends QueryResultRow {
  id: string;
  name: string;
  dist: number;
  bearing: number;
  state: string;
}

const getClosestSnotels = async (
  lat: number,
  lon: number,
  n: number,
  minElevation: number
) => {
  const snotels = await db.$queryRaw<SnotelDistance[]>`
SELECT id, name, elevation, lat, lon, state,
coords::geography <-> ST_SetSRID(ST_MakePoint( ${lon}, ${lat} ),4326)::geography AS dist,
ST_Azimuth( ST_SetSRID(ST_MakePoint( ${lon}, ${lat} ),4326)::geography, coords::geography )/(2*pi())*360 AS bearing
FROM snotel WHERE elevation > ${FEET_TO_METERS * minElevation}
ORDER BY dist LIMIT ${n};
    `;

  return snotels;
};

async function SnotelLink({ snotel }: { snotel: SnotelDistance }) {
  const distanceInMiles = (snotel.dist * METERS_TO_MILES).toFixed(2);

  const snotelData = new Snotel(snotel.id);

  await snotelData.getWaterYearDailyData();

  const snowData = snotelData.getDailySnowGraphData();
  const tempData = snotelData.getDailyTemperatureData();

  return (
    <div className="my-6 flex min-h-fit">
      <div className="flex flex-col p-2">
        <Link key={snotel.id} href={`/snotel/${snotel.id}`}>
          <h2>
            {snotel.name}, {snotel.state}{" "}
          </h2>
        </Link>
        <p>
          {distanceInMiles} miles {translateBearing(snotel.bearing)}{" "}
        </p>
        <p>{Math.floor(snotel.elevation * METERS_TO_FEET)} ft.</p>
        <Link
          href={`/snotel/${snotel.id}`}
          className=" mt-6 rounded bg-indigo-700 p-2 font-bold text-white"
        >
          More Info
        </Link>
      </div>
      <div className="block " style={{ height: 200, width: "40%" }}>
        <h3 className="px-3 pb-2 text-xs font-bold">Snow Depth</h3>
        <SnotelSnowGraphWithoutAxis
          snowDepth={snowData.snowDepth}
          height={150}
        />
      </div>
      <div className="block " style={{ height: 200, width: "40%" }}>
        <h3 className="px-3 pb-2 text-xs font-bold">Temperature</h3>
        <SnotelTemperatureGraphWithoutAxis
          high={tempData.high}
          low={tempData.low}
          avg={tempData.avg}
          height={150}
        />
      </div>
    </div>
  );
}

function SnotelLinkSection({ snotels }: { snotels: SnotelDistance[] }) {
  return (
    <div>
      {snotels.map((snotel) => (
        <div key={snotel.id}>
          <Suspense fallback={<p>loading...</p>}>
            <SnotelLink snotel={snotel} />
          </Suspense>
        </div>
      ))}
    </div>
  );
}

const decodeLatitude = (lat: number) => {
  const latDegrees = Math.floor(Math.abs(lat));
  const latMinutes = Math.floor((Math.abs(lat) - latDegrees) * 60);
  const latSeconds = Math.floor(
    ((Math.abs(lat) - latDegrees) * 60 - latMinutes) * 60
  );

  return `${latDegrees}°${latMinutes}'${latSeconds}" ${lat > 0 ? "N" : "S"}`;
};

const decodeLongitude = (lon: number) => {
  const lonDegrees = Math.floor(Math.abs(lon));
  const lonMinutes = Math.floor((Math.abs(lon) - lonDegrees) * 60);
  const lonSeconds = Math.floor(
    ((Math.abs(lon) - lonDegrees) * 60 - lonMinutes) * 60
  );

  return `${lonDegrees}°${lonMinutes}'${lonSeconds}" ${lon > 0 ? "E" : "W"}`;
};

export default async function SnotelListPage({
  params,
  searchParams,
}: {
  params: { geohash: string };
  searchParams: { elev: string };
}) {
  const { lat, lon } = Geohash.decode(decodeURI(params.geohash).trim());

  const snotels = await getClosestSnotels(
    lat,
    lon,
    5,
    parseInt(searchParams?.elev) || 0
  );

  return (
    <div>
      <div className="flex items-end bg-indigo-900 px-6 py-2 text-white">
        <h1 className=" mr-2 text-xl font-bold">Snotel</h1>
        <p className="font-light">
          near{" "}
          <span className="text-xs">
            {decodeLatitude(lat)}, {decodeLongitude(lon)}
          </span>
        </p>
      </div>
      <Map containerProps={{ center: [lat, lon] }} />
      <ElevationSelector geohash={params.geohash} />
      <SnotelLinkSection snotels={snotels} />
    </div>
  );
}
