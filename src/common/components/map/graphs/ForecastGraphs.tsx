/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use client";
import React from "react";
import type { useDailyForecast } from "~/common/components/hooks/noaa/useDailyForecast";
import Echarts from "echarts-for-react";
import { useSettings } from "../useSettings";
import { UnitConverter } from "~/app/UnitConverter";
import { TemperatureGraph } from "./TemperatureGraph";
import { ForecastWindGraph } from "~/modules/forecast/components/ForecastWindGraph";

type Params = {
  data: {
    name: string;
    minSnow: number;
    maxSnow: number;
    minTotalSnow: number;
    maxTotalSnow: number;
    minWindSpeed: number;
    maxWindSpeed: number;
  };
  color: string;
};

export type ChartData = {
  name: string;
  minSnow: number;
  maxSnow: number;
  minTotalSnow: number;
  maxTotalSnow: number;
  temperature: number;
};

export const GRID = { top: 50, right: 20, bottom: 45, left: 30 };

export const HEIGHT = 200;

export const tooltipDiv =
  '<div style="display:flex;flex-direction:column;min-width:200px;">';
const parseWindData = (text: string, units: "imperial" | "metric") => {
  const windSpeed = /(\d+)(?:\s*to\s*(\d+))?/.exec(text);

  if (!windSpeed)
    return {
      minWindSpeed: 0,
      maxWindSpeed: 0,
    };

  const minWindSpeed = parseInt(windSpeed[1] ?? "0");
  const maxWindSpeed = parseInt(windSpeed[2] ?? windSpeed[1] ?? "0");

  return {
    minWindSpeed:
      units === "metric"
        ? minWindSpeed
        : Math.round(UnitConverter.kphToMph(minWindSpeed)),
    maxWindSpeed:
      units === "metric"
        ? maxWindSpeed
        : Math.round(UnitConverter.kphToMph(maxWindSpeed)),
  };
};

export const ForecastGraphs = ({
  dailyForecast,
}: {
  dailyForecast: ReturnType<typeof useDailyForecast>;
}) => {
  const { units } = useSettings();

  let cummulativeMin = 0;
  let cummulativeMax = 0;

  const chartData = dailyForecast.data?.data.map((period) => {
    const minSnow =
      units === "metric"
        ? period.snow.min ?? 0
        : Math.round(UnitConverter.cmToInches(period.snow.min ?? 0));

    // this is the difference between the max and min snowfall so the bar chart can show the range
    const maxSnow =
      units === "metric"
        ? (period.snow.max ?? 0) - (period.snow.min ?? 0)
        : Math.round(
            UnitConverter.cmToInches(
              (period.snow.max ?? 0) - (period.snow.min ?? 0)
            )
          );

    cummulativeMin += minSnow;
    cummulativeMax += maxSnow;

    const temperature =
      units === "metric"
        ? period.temperature
        : Math.round(UnitConverter.celsiusToFareinheit(period.temperature));

    const { minWindSpeed, maxWindSpeed } = parseWindData(
      period.windSpeed,
      units
    );

    return {
      name: period.name,
      minSnow,
      maxSnow,
      minTotalSnow: cummulativeMin,
      maxTotalSnow: cummulativeMax,
      temperature,
      minWindSpeed,
      maxWindSpeed,
      isDaytime: period.isDaytime,
    };
  });

  const lastPeriod = chartData ? chartData[chartData.length - 1] : null;

  return (
    <div className="pb-12">
      <h3 className="ml-1 text-[.8rem] font-bold ">Snow Forecast</h3>
      {lastPeriod?.maxTotalSnow === 0 ? (
        <div className="mb-2 py-4 text-center text-sm font-semibold text-muted-foreground">
          No snow forecasted for the next 7 days
        </div>
      ) : (
        <>
          <Echarts
            className="-mt-2 max-h-[200px]"
            // group="forecast"
            option={{
              title: {
                subtext: "Daily snow accumulation forecast for the next 7 days",
                textStyle: {
                  fontSize: ".8rem",
                  fontWeight: "bold",
                },
                subtextStyle: {
                  fontSize: ".7rem",
                },
              },
              dataset: {
                dimensions: ["name", "minSnow", "maxSnow"],
                source: chartData,
              },
              grid: GRID,
              xAxis: { type: "category" },
              yAxis: { type: "value" },
              series: [
                {
                  type: "bar",
                  stack: "snow",
                  encode: { x: "name", y: "minSnow" },
                  color: "#0284c7",
                },
                {
                  type: "bar",
                  stack: "snow",
                  encode: { x: "name", y: "maxSnow" },
                  color: "#0ea5e9",
                },
              ],
              tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                formatter: (params: unknown) => {
                  const typedParams = params as Params[];
                  const data = typedParams[0]!;
                  const { name, minSnow, maxSnow } = data.data;
                  const color1 = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${data.color};"></span>`;
                  const unit = units === "metric" ? "cm" : "in";
                  // capturing regex to replace "on tonight" with "tonight", "on today" with "today". There may be other cases like "evening" or "morning" that need to be handled

                  const snowString =
                    maxSnow === 0
                      ? `${minSnow} ${unit}`
                      : `${minSnow} - ${maxSnow + minSnow} ${unit}`;
                  if (maxSnow === 0)
                    return `${tooltipDiv}No Snow on ${name}</div>`
                      .replace(/\bon\s+(tonight|today)\b/gi, "$1")
                      .replace(/on This Afternoon/gi, "this Afternoon");
                  return (
                    `${tooltipDiv}` +
                    `<div  class="text-xs" >New Snow on ${name}</div>`
                      .replace(/\bon\s+(tonight|today)\b/gi, "$1")
                      .replace(/on This Afternoon/gi, "this Afternoon") +
                    `<div class="font-bold">${color1} ${snowString}</div>` +
                    `</div>`
                  );
                },
              },
            }}
            opts={{
              height: HEIGHT,
            }}
          />
          <Echarts
            className="max-h-[200px]"
            option={{
              title: {
                subtext:
                  "Total new snow accumulation forecast for the next 7 days",
                textStyle: {
                  fontSize: ".8rem",
                  fontWeight: "bolder",
                },
                subtextStyle: {
                  fontSize: ".7rem",
                },
              },
              dataset: {
                dimensions: ["name", "minTotalSnow", "maxTotalSnow"],
                source: chartData,
              },
              grid: GRID,
              xAxis: { type: "category" },
              yAxis: { type: "value" },
              series: [
                {
                  type: "bar",
                  stack: "snow",
                  encode: { x: "name", y: "minTotalSnow" },
                  color: "#0284c7",
                },
                {
                  type: "bar",
                  stack: "snow",
                  encode: { x: "name", y: "maxTotalSnow" },
                  color: "#0ea5e9",
                },
              ],
              tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                confine: true,
                formatter: (params: unknown) => {
                  const typedParams = params as Params[];
                  const data = typedParams[0]!;
                  const { name, minTotalSnow, maxTotalSnow } = data.data;
                  const color1 = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${data.color};"></span>`;
                  const unit = units === "metric" ? "cm" : "in";
                  const snowString =
                    maxTotalSnow === 0
                      ? `${minTotalSnow} ${unit}`
                      : `${minTotalSnow} - ${
                          maxTotalSnow + minTotalSnow
                        } ${unit}`;
                  if (maxTotalSnow === 0)
                    return (
                      tooltipDiv +
                      "No Snow" +
                      ` by ${name}</div>`
                        .replace(/\bon\s+(tonight|today)\b/gi, "$1")
                        .replace(/by This Afternoon/gi, "this Afternoon")
                    );
                  return (
                    tooltipDiv +
                    `<div  class="text-xs" >Total Accumulation by ${name}</div>` +
                    `<div class="font-bold">${color1} ${snowString}</div>` +
                    `</div>`
                  );
                },
              },
            }}
            opts={{
              height: HEIGHT - 20,
            }}
          />
        </>
      )}
      <h3 className="ml-1 text-[.8rem] font-bold">Temperature Forecast</h3>
      <TemperatureGraph data={chartData} />

      <h3 className="ml-1 text-[.8rem] font-bold">Wind Forecast</h3>
      {/* <Echarts
        className="max-h-[200px -mt-2" 
        option={{
          title: {
            subtext: "Wind forecast for the next 7 days",
            textStyle: {
              fontSize: ".8rem",
              fontWeight: "bolder",
            },
            subtextStyle: {
              fontSize: ".7rem",
            },
          },
          dataset: {
            dimensions: ["name", "minWindSpeed", "maxWindSpeed"],
            source: chartData,
          },
          grid: GRID,
          xAxis: { type: "category" },
          yAxis: { type: "value" },
          series: [
            {
              type: "line",
              encode: { x: "name", y: "minWindSpeed" },
              color: "#f6c244",
              smooth: true,
            },
            {
              type: "line",
              encode: { x: "name", y: "maxWindSpeed" },
              color: "#f6c244",
              smooth: true,
            },
          ],
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: (params:unknown) => {
              const typedParams = params as Params[];
              const { data } = typedParams[0]!;
              const unit = units === "metric" ? "kph" : "mph";

              const windString =
                data.minWindSpeed === data.maxWindSpeed
                  ? `${data.minWindSpeed} ${unit}`
                  : `${data.minWindSpeed} - ${data.maxWindSpeed} ${unit}`;
              return (
                tooltipDiv +
                `<div  class="text-xs" >Wind Speed on ${data.name}</div>`
                  .replace(/\bon\s+(tonight|today)\b/gi, "$1")
                  .replace(
                    /\bon\s+(This\s+night|evening|morning|Afternoon)\b/gi,
                    "$1"
                  ) +
                `<div class="font-bold"> ${windString}</div>` +
                `</div>`
              );
            },
          },
        }}
        opts={{
          height: HEIGHT - 20,
        }}
      /> */}
      <ForecastWindGraph
        dates={chartData?.map((d) => d.name) ?? []}
        low={chartData?.map((d) => d.minWindSpeed) ?? []}
        high={chartData?.map((d) => d.maxWindSpeed) ?? []}
        gusts={dailyForecast.data?.gusts ?? []}
      />
    </div>
  );
};
