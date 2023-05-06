import Link from "next/link";
import type { QueryResultRow } from "pg";
import { BaseMap } from "~/components/maps";
import { postgresql } from "~/server/db";

import {
  FEET_TO_METERS,
  METERS_TO_FEET,
  METERS_TO_MILES,
} from "~/utils/units";

interface SnotelDistance extends QueryResultRow {
  id: string;
  name: string;
  dist: number;
  bearing: number;
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
SELECT id, name, elevation, lat, lon,
coords::geography <-> ST_SetSRID(ST_MakePoint( ${lon}, ${lat} ),4326)::geography AS dist,
ST_Azimuth( ST_SetSRID(ST_MakePoint( ${lon}, ${lat} ),4326)::geography, coords::geography )/(2*pi())*360 AS bearing
FROM snotel WHERE elevation > ${FEET_TO_METERS * minElevation}
ORDER BY dist LIMIT ${n};
    `);

  return snotels.rows;
};

function SnotelLink({ snotel }: { snotel: SnotelDistance }) {
  const distanceInMiles = (snotel.dist * METERS_TO_MILES).toFixed(2);

  return (
    <div className="my-6">
      {" "}
      <Link key={snotel.id} href={`/snotel/${snotel.id}`}>
        <h2>{snotel.name}</h2>
        <p>
          {distanceInMiles} miles to the {translateBearing(snotel.bearing)}{" "}
        </p>
        <p>
          lat: {snotel.lat} lon: {snotel.lon}
        </p>
        <p>{Math.floor(snotel.elevation * METERS_TO_FEET)} ft.</p>
      </Link>
    </div>
  );
}

export default async function SnotelListPage() {
  const snotels = await getClosestSnotels(46.87, -113.99, 5, 5000);



  return (
    <div>
      <h1>Snotel</h1>
      <BaseMap containerProps={{ center: [46.87, -113.99], zoom: 9 }} />
      {snotels.map((snotel) => (
        <SnotelLink key={snotel.id} snotel={snotel} />
      ))}
    </div>
  );
}
