"use client";
import React  from "react";
import {
   type NearbySnotel,
  Snotel,
  useNearbySnotel,
} from "../snotel/hooks/useSnotel";
import { translateBearing } from "~/common/utils/translateBearing";
import { METERS_TO_FEET } from "~/common/utils/units";
import { SnowIcon } from "~/app/test/SnowIcon";
import { twMerge } from "tailwind-merge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/ui/tabs";
import SChart from "~/common/components/SChart";
import type { EChartsOption } from "echarts";
import { INDIGO, PURPLE, RED } from "~/common/styles/ColorPalette"; 
const N_SNOTEL = 6;

function SnotelCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
 
  return (
    <div
      className={twMerge(
        " flex min-h-48 w-full  max-w-md flex-col  items-center rounded p-4 text-center text-xl font-bold shadow ",
        className
      )} 
    >
      {children}
    </div>
  );
}

function LoadingCard({
  data,
}: {
  data?: {
    id?: string;
    name?: string;
    distance?: number;
    bearing?: number;
    elevation?: number;
  };
}) {
  const showHeader =
    data?.name !== undefined &&
    data?.distance !== undefined &&
    data?.bearing !== undefined &&
    data?.elevation !== undefined;
  return (
    <SnotelCard className="opacity-70 w-[400px]">
      <h3 className=" pb-2 text-lg font-bold">
        {showHeader ? (
          <>
            {data.name}{" "}
            <span className="text-sm font-light">
              {data.distance} miles{" "}
              {data.bearing !== undefined && translateBearing(data.bearing)} at{" "}
              {((data.elevation || 0) * METERS_TO_FEET).toFixed(0)} ft.
            </span>
          </>
        ) : <p className="opacity-0" >loading</p>}
      </h3>
      <SnowIcon size="lg" className="size-16" loading />
      Loading {showHeader ? "Snotel" : "Data"}...
    </SnotelCard>
  );
}

export function SnotelSection({ geohash }: { geohash: string }) {
  const snotel = useNearbySnotel({ geohash, n: N_SNOTEL });

  if (snotel.isLoading)
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold">Nearby Snotel</h3>
        <div className="3xl:grid-cols-3 grid justify-items-center gap-4 xl:grid-cols-2">
          {" "}
          {Array(N_SNOTEL)
            .fill(null)
            .map((x, i) => (
              <LoadingCard key={i} />
            ))}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xl font-bold">Nearby Snotel</h3>
      <div className="3xl:grid-cols-3 grid justify-items-center gap-4 xl:grid-cols-2">
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
      <div className="flex flex-col gap-4 w-[400px]">
        <LoadingCard data={snotel.data} />
      </div>
    );
  if (snotel.isError) return null;

  return (
    <SnotelCard>
      <div className="flex w-full flex-col gap-2 text-sm">
        <h3 className=" w-full justify-self-start pb-2 text-left text-lg font-bold">
          {snotel.data.name}{" "}
          <span className="text-sm font-light">
            {snotel.data.distance} miles{" "}
            {snotel.data.bearing !== undefined &&
              translateBearing(snotel.data.bearing)}{" "}
            at {((snotel.data.elevation || 0) * METERS_TO_FEET).toFixed(0)} ft.
          </span>
        </h3>
      </div>{" "}
      <Tabs defaultValue="snow" className="w-[400px]">
        <TabsList className="w-full">
          <TabsTrigger className="w-full" value="snow">
            Snow
          </TabsTrigger>
          <TabsTrigger className="w-full" value="temperature">
            Temperature
          </TabsTrigger>
        </TabsList>
        <TabsContent value="snow"  >
          <SnowAndSweSection data={snotelData} />
        </TabsContent>
        <TabsContent value="temperature"  > 
          <TemperatureSection data={snotelData} />
        </TabsContent>
      </Tabs>
    </SnotelCard>
  );
}

function TemperatureSection({ data }: { data: NearbySnotel["data"]["data"] }) {
  if (!data) return null;

  const last7Days = data.toReversed().slice(0, 30).toReversed();

  const currentObs = last7Days[last7Days.length - 1];

  const options = {
    animation: false,
    title: {
      text: "Temperature",
      left: 20,
      top: 0,
        backgroundColor: "white",
      textStyle: {
        color: "#616E7C",
      },
      subtext: currentObs?.temp.obs
        ? "Currently " + currentObs?.temp.obs.toString() + "°F"
        : undefined,
      itemGap: 0,
    },

    xAxis: {
      type: "category",
      data: last7Days.map((x) => x.date?.toLocaleDateString()),
    },
    yAxis: {
      type: "value",
    },
    grid: {
      top: 30,
      left: 25,
      right: 25,
      bottom: 20,
    },
    series: [
      {
        data: last7Days.map((x) => x.temp.avg ?? undefined) as number[],
        type: "line",
        smooth: true,
        symbol: "none",
        markLine: {
          animation: false,
          symbol: "none",
          data: [
            {
              name: "Freezing",
              yAxis: 32,
              symbol: "none",
              label: {
                show: false,
              },
              emphasis: {
                disabled: true,
              },
              lineStyle: {
                color: PURPLE[500],
                type: "dashed",
              },
            },
          ],
        },
      },
      {
        data: last7Days.map((x) => x.temp.max ?? undefined) as number[],
        type: "line",
        smooth: true,
        symbol: "none",
      },
      {
        data: last7Days.map((x) => x.temp.min ?? undefined) as number[],
        type: "line",
        smooth: true,
        symbol: "none",
      },
    ],
    visualMap: {
      show: false,
      type: "continuous",
      min: 0,
      max: 32 * 4, // 128
      inRange: {
        color: [
          INDIGO[800], // 0 - 8
          INDIGO[500], //  8 - 16
          INDIGO[300], // 16 -  24
          INDIGO[300], //  24 - 32
          PURPLE[500], // 32 - 40
          PURPLE[600], // 40 - 48
          PURPLE[500], // 48 - 56
          RED[300], // 56 - 64
          RED[400], // 64 - 72
          RED[500], // 72 - 80
          RED[600], // 80 - 88
          RED[700], // 88 - 96
          RED[700], // 96 - 104
          RED[700], // 104 - 112
          RED[700], // 112 - 120
          RED[700], // 120 - 128
        ],
      },
    },
  } satisfies EChartsOption;

  return (
    <div className=" w-full gap-x-2  text-left text-sm"> 
      <SChart option={options} style={{ width: "100%", maxHeight: "200px" }} />
    </div>
  );
}

function SnowAndSweSection({ data }: { data: NearbySnotel["data"]["data"] }) {  if (!data) return null;

const last7Days = data.toReversed().slice(0, 30).toReversed();

const currentObs = last7Days[last7Days.length - 1];

const options = {
  animation: false, 

  xAxis: {
    type: "category",
    data: last7Days.map((x) => x.date?.toLocaleDateString()),
  },
  yAxis: {
    type: "value",
  },
  grid: {
    top: 5,
    left: 25,
    right: 25,
    bottom: 20,
  },
  series: [
    {
      data: last7Days.map((x) => x.snow.depth ?? undefined) as number[],
      type: "line",
      smooth: true,
      symbol: "none", 
    }, 
  ],
  
} satisfies EChartsOption;


  return (
    <div className="grid grid-cols-2 w-full flex-col items-stretch justify-between gap-x-6 gap-y-4  lg:flex-row">
      <SnowDepthSection data={data} />
      <SweSection data={data} />
      <div className="col-span-2">
      <SChart option={options} style={{ width: "100%", maxHeight: "120px"}} /></div>
    </div>
  );
}

function SnowDepthSection({ data }: { data: NearbySnotel["data"]["data"] }) {
  if (!data) return null;
  return (
    <div className="grid  w-48 grid-cols-3 gap-x-2 text-center text-sm">
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
    <div className="grid w-48 grid-cols-3 gap-x-2 text-center text-sm">
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
