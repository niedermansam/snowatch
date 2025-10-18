"use client";
import React from "react";
import { api } from "~/trpc/react";
import { useSettings } from "./useSettings";
import { UnitConverter } from "~/app/UnitConverter";
import { translateBearingToAbbreviation } from "./PopupContent";
import {
  type SnotelElementCodes,
  useSnotelData,
} from "../hooks/noaa/useSnotelData";
import { Card, CardHeader, CardContent } from "~/components/ui/card";
import Echarts from "echarts-for-react";

type SnotelMetadata = {
  id: string;
  name: string;
  elevation: number;
  lat: number;
  lon: number;
  state: string;
  dist: number;
  bearing: number;
};

export const SnotelSection = ({ hash }: { hash: string }) => {
  const data = api.snotel.list.useQuery({
    hash,
  });

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6 text-sm">
        {data.isLoading && "Loading..."}
        {data.isError && "Error loading snotel data"}
        {data.data?.map((snotel) => (
          <SnotelGraph data={snotel} key={snotel.id} />
        ))}
      </div>
    </div>
  );
};

const SnotelGraph = ({ data: meta }: { data: SnotelMetadata }) => {
  const { units } = useSettings();

  const query = useSnotelData(meta.id);

  const [elementCode, setElementCode] =
    React.useState<keyof typeof SnotelElementCodes>("SNWD");

  let elevationString = meta.elevation.toString();
  if (units === "imperial")
    elevationString =
      UnitConverter.metersToFeet(meta.elevation).toFixed(0) + " ft.";
  else elevationString += " m.";

  let distance = meta.dist.toFixed(1);

  if (units === "imperial")
    distance = UnitConverter.metersToMiles(meta.dist).toFixed(1) + " mi.";
  else distance = meta.dist.toFixed(1) + " km.";

  const currentData = query.data?.data.find(
    (d) => d.stationElement.elementCode === elementCode
  );
  return (
    <Card key={meta.id}>
      <CardHeader className="flex w-full flex-row justify-between text-xs font-light">
        <div className="text-base font-bold text-muted-foreground">
          {meta.name}
        </div>{" "}
        <div className="text-muted-foreground">
          {distance} {translateBearingToAbbreviation(meta.bearing)} at{" "}
          {elevationString}{" "}
        </div>
      </CardHeader>
      <CardContent className="h-[250px]">
        <Echarts
          option={{
            tooltip: {
              trigger: "axis",
            },
            xAxis: {
              type: "category",
            },
            yAxis: {
              type: "value",
            },
            grid: {
              left: 35,
              right: 35,
              top: 30,
              bottom: 30,
            },

            dataset: {
              source:
                typeof currentData === "undefined"
                  ? []
                  : units === "imperial"
                  ? currentData?.values
                  : currentData?.values.map((v) => ({
                      date: v.date,
                      value: Math.round(UnitConverter.inchesToCm(v.value)),
                    })),
              dimensions: [
                {
                  name: "date",
                  type: "time",
                },
                {
                  name: "value",
                  type: "float",
                },
              ],
            },

            series: [
              {
                type: "line",
                encode: {
                  x: "date",
                  y: "value",
                },
                areaStyle: {},
                smooth: true,
              },
            ],
          }}
          opts={{ height: 200 }}
        />
      </CardContent>
    </Card>
  );
};
