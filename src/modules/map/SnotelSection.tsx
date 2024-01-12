"use client";
import React from "react";
import { NearbySnotel, useNearbySnotel } from "../snotel/hooks/useSnotel";
import { translateBearing } from "~/common/utils/translateBearing";
import { METERS_TO_FEET } from "~/common/utils/units";

export function SnotelSection({ geohash }: { geohash: string }) {
  const snotel = useNearbySnotel({ geohash, n: 6 });

 
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xl font-bold">Nearby Snotel</h3>
      <div className="grid md:grid-cols-2 gap-2">
        {snotel.map((x) => {
          return (
            <SnotelSummary
              key={x.data.id || "" + Math.random().toString()}
              snotel={x}
            />
          );
        })}
      </div>
    </div>
  );
}
function getSnowDepthChange(
  snotelData: NonNullable<NearbySnotel["data"]["data"]>,
  periods: number
) {
  const mostRecent = snotelData[snotelData.length - 1];
  const previous = snotelData[snotelData.length - 1 - periods];
  if (!previous || previous.snow.depth === null) return null;
  if (!mostRecent || mostRecent.snow.depth === null) return null;

  const change = mostRecent.snow.depth - previous.snow.depth;

  let prefix = "";

  if (change > 0) prefix = "+";

  return prefix + change.toFixed(0);
}

function getSweChange(
  snotelData: NonNullable<NearbySnotel["data"]["data"]>,
  periods: number
) {
  const mostRecent = snotelData[snotelData.length - 1];
  const previous = snotelData[snotelData.length - 1 - periods];
  if (!previous || previous.swe.value === null) return null;
  if (!mostRecent || mostRecent.swe.value === null) return null;

  const change = mostRecent.swe.value - previous.swe.value;

  let prefix = "";

  if (change > 0) prefix = "+";

  return prefix + change.toFixed(2);
}

function SnotelSummary({ snotel }: { snotel: NearbySnotel }) {
 
  const snotelData = snotel.data.data;

  if (snotel.isLoading) return null;
  if (snotel.isError) return null;

  return (
    <div className="p-4">
      <div className="flex flex-col gap-2 text-sm">
        <h3 className=" text-lg font-bold pb-2">
          {snotel.data.name}{" "}
          <span className="text-sm font-light"> 
            {" "}
            {snotel.data.distance} miles{" "}
            {snotel.data.bearing !== undefined &&
              translateBearing(snotel.data.bearing)}{" "}
            at {((snotel.data.elevation || 0) * METERS_TO_FEET).toFixed(0)} ft.
          </span>
        </h3>
      </div>{" "}
      <div className="flex gap-x-6">
        <SnowDepthSection data={snotelData} />
        <SweSection data={snotelData} />
      </div>
    </div>
  );
}

function SnowDepthSection({ data }: { data: NearbySnotel["data"]["data"] }) {
  if (!data) return null;
  return (
    <div className="grid max-w-xs grid-cols-3 gap-x-2 text-center text-sm">
      <p className="col-span-2 w-full text-left text-base font-bold">
        Snow Depth:
      </p>
      <p className="w-full text-center text-base font-bold ">
        {data[data.length - 1]?.snow.depth}&quot;
      </p>

      <div>
        {getSnowDepthChange(data, 1)}&quot; <br />
        24hr
      </div>
      <div>
        {getSnowDepthChange(data, 2)}&quot; <br />
        48hr
      </div>
      <div>
        {getSnowDepthChange(data, 7)}&quot; <br />
        7d
      </div>
    </div>
  );
}

function SweSection({ data }: { data: NearbySnotel["data"]["data"] }) {
  if (!data) return null;

  const lastValue = data[data.length - 1]?.swe.value;

  return (
    <div className="grid max-w-xs grid-cols-3 gap-x-2 text-center text-sm">
      <p className="w-full text-left text-base font-bold">SWE:</p>
      <p className="col-span-2 w-full text-center text-base font-bold">
        {data[data.length - 1]?.swe.value}&quot;
      </p>
      <div>
        {getSweChange(data, 1) || 0}&quot; <br />
        24hr
      </div>
      <div>
        {getSweChange(data, 2) || 0}&quot; <br />
        48hr
      </div>
      <div>
        {getSweChange(data, 7) || 0}&quot; <br />
        7d
      </div>
    </div>
  );
}
