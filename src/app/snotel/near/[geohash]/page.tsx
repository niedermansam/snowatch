import Link from "next/link";
import type { QueryResultRow } from "pg";
import dynamic from "next/dynamic";
import { postgresql } from "~/server/db";

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

interface SnotelDistance extends QueryResultRow {
  id: string;
  name: string;
  dist: number;
  bearing: number;
  state: string;
}

function translateBearing(bearing: number) {
  let positiveBearing: number = bearing;
  if (bearing < 0) {
    positiveBearing = bearing + 360;
  }

  if (positiveBearing > 337.5 || positiveBearing <= 22.5) return "N";
  if (positiveBearing > 22.5 && positiveBearing <= 67.5) return "NE";
  if (positiveBearing > 67.5 && positiveBearing <= 112.5) return "E";
  if (positiveBearing > 112.5 && positiveBearing <= 157.5) return "SE";
  if (positiveBearing > 157.5 && positiveBearing <= 202.5) return "S";
  if (positiveBearing > 202.5 && positiveBearing <= 247.5) return "SW";
  if (positiveBearing > 247.5 && positiveBearing <= 292.5) return "W";
  if (positiveBearing > 292.5 && positiveBearing <= 337.5) return "NW";
  return "N";
}

const getClosestSnotels = async (
  lat: number,
  lon: number,
  n: number,
  minElevation: number
) => {
  const snotels = await postgresql.query<SnotelDistance>(`
SELECT id, name, elevation, lat, lon, state,
coords::geography <-> ST_SetSRID(ST_MakePoint( ${lon}, ${lat} ),4326)::geography AS dist,
ST_Azimuth( ST_SetSRID(ST_MakePoint( ${lon}, ${lat} ),4326)::geography, coords::geography )/(2*pi())*360 AS bearing
FROM snotel WHERE elevation > ${FEET_TO_METERS * minElevation}
ORDER BY dist LIMIT ${n};
    `);

  return snotels.rows;
};

async function SnotelLink({ snotel }: { snotel: SnotelDistance }) {
  const distanceInMiles = (snotel.dist * METERS_TO_MILES).toFixed(2);

  const snotelData = new Snotel(snotel.id);

  await snotelData.getWaterYearDailyData();

  const snowData = snotelData.getDailySnowGraphData();
  const tempData = snotelData.getDailyTemperatureData();

  return (
    <div className="my-6 flex min-h-fit">
      <div className="p-2 flex flex-col">
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
          snowDepth={snowData.snowDepths}
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
          {/* @ts-expect-error Async Server Component */}
          <SnotelLink snotel={snotel} />
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
  searchParams: { elev: number };
}) {
  const { lat, lon } = Geohash.decode(decodeURI(params.geohash).trim());

  const snotels = await getClosestSnotels(lat, lon, 5, searchParams?.elev || 0);

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
      <Map containerProps={{ center: [lat, lon], zoom: 8 }} />
      <ElevationSelector geohash={params.geohash} />
      <SnotelLinkSection snotels={snotels} />
    </div>
  );
}
