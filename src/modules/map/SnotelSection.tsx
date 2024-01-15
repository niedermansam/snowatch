"use client";
import React from "react";
import { NearbySnotel, Snotel, useNearbySnotel } from "../snotel/hooks/useSnotel";
import { translateBearing } from "~/common/utils/translateBearing";
import { METERS_TO_FEET } from "~/common/utils/units";
import { SnowIcon } from "~/app/test/page";
import { twMerge } from "tailwind-merge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const N_SNOTEL = 6;

function SnotelCard({children, className}: {children: React.ReactNode, className?: string}) {
  return (
    <div className={twMerge(" flex min-h-48 w-full flex-col items-center  rounded p-4 text-center text-xl font-bold shadow")}>
      {children}
    </div>
  );
}

function LoadingCard({data}: {
  data?: {
    id?: string;
    name?: string;
    distance?: number;
    bearing?: number;
    elevation?: number;
  }
}) {
  const showHeader = data?.name !== undefined && data?.distance !== undefined && data?.bearing !== undefined && data?.elevation !== undefined;
  return (
    <SnotelCard className="opacity-70">
      
        <h3 className=" pb-2 text-lg font-bold">
         {showHeader && ( <>{data.name}{" "}
          <span className="text-sm font-light">
            {data.distance} miles{" "}
            {data.bearing !== undefined &&
              translateBearing(data.bearing)}{" "}
            at {((data.elevation || 0) * METERS_TO_FEET).toFixed(0)} ft.
          </span></>
      )}
        </h3>
      <SnowIcon size="lg" className="size-16" loading />
      Loading {showHeader ? 'Snotel' : "Data"}...
    </SnotelCard>
  );
}

export function SnotelSection({ geohash }: { geohash: string }) {
  const snotel = useNearbySnotel({ geohash, n: N_SNOTEL });

  if (snotel.isLoading)
    return (
      <div className="mt-12 grid grid-cols-2 gap-4">
        {" "}
        {Array(N_SNOTEL)
          .fill(null)
          .map((x, i) => (
            <LoadingCard key={i} />
          
          ))}
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xl font-bold">Nearby Snotel</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {snotel.data.map((x) => {
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

  if (snotel.isLoading)
    return (
      <div className="flex flex-col gap-4">
        <LoadingCard data={snotel.data} />
      </div>
    );
  if (snotel.isError) return null;

  return (
    <SnotelCard>
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList className="w-full">
          <TabsTrigger className="w-full" value="account">
            Snow
          </TabsTrigger>
          <TabsTrigger className="w-full" value="password">
            Temperature
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <div className="flex w-full flex-col gap-2 text-sm">
            <h3 className=" w-full justify-self-start pb-2 text-left text-lg font-bold">
              {snotel.data.name}{" "}
              <span className="text-sm font-light">
                {snotel.data.distance} miles{" "}
                {snotel.data.bearing !== undefined &&
                  translateBearing(snotel.data.bearing)}{" "}
                at {((snotel.data.elevation || 0) * METERS_TO_FEET).toFixed(0)}{" "}
                ft.
              </span>
            </h3>
          </div>{" "}
          <div className="flex w-full flex-col items-stretch justify-between gap-x-6 gap-y-4 lg:flex-row">
            <SnowDepthSection data={snotelData} />
            <SweSection data={snotelData} />
          </div>
        </TabsContent>
        <TabsContent value="password">
          <div className="flex w-full flex-col gap-2 text-sm">
            <h3 className=" w-full justify-self-start pb-2 text-left text-lg font-bold">
              {snotel.data.name}{" "}
              <span className="text-sm font-light">
                {snotel.data.distance} miles{" "}
                {snotel.data.bearing !== undefined &&
                  translateBearing(snotel.data.bearing)}{" "}
                at {((snotel.data.elevation || 0) * METERS_TO_FEET).toFixed(0)}{" "}
                ft.
              </span>
            </h3>
          </div>
          <p className="pt-4">Coming Soon...</p>
        </TabsContent>
      </Tabs>
    </SnotelCard>
  );
}

function SnowDepthSection({ data }: { data: NearbySnotel["data"]["data"] }) {
  if (!data) return null;
  return (
    <div className="grid  grid-cols-3 gap-x-2 text-center text-sm w-48">
      <p className="col-span-2 w-full text-left text-base font-bold">
        Snow Depth:
      </p>
      <p className="w-full text-right text-base font-bold ">
        {data[data.length - 1]?.snow.depth}&quot;
      </p>

      <div className="font-light">
        {getSnowDepthChange(data, 1)}&quot; <br />
        24hr
      </div>
      <div className="font-light">
        {getSnowDepthChange(data, 2)}&quot; <br />
        48hr
      </div>
      <div className="font-light">
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
    <div className="grid grid-cols-3 gap-x-2 text-center text-sm w-48">
      <p className="w-full text-left text-base  font-bold">SWE:</p>
      <p className="col-span-2 w-full text-right text-base  font-bold">
        {data[data.length - 1]?.swe.value}&quot;
      </p>
      <div className="px-2 font-light">
        {getSweChange(data, 1) || 0}&quot; <br />
        24hr
      </div>
      <div className="px-2 font-light">
        {getSweChange(data, 2) || 0}&quot; <br />
        48hr
      </div>
      <div className="px-2 font-light">
        {getSweChange(data, 7) || 0}&quot; <br />
        7d
      </div>
    </div>
  );
}

function StyledSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xl font-bold">{title}</h3>
      {children}
    </div>
  );
}
