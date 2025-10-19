import SChart from "~/common/components/SChart";
import { getDisplayDates } from "../utils/getDisplayDates";
import { GRAY, RED, YELLOW } from "~/common/styles/ColorPalette";
import type { ECBasicOption } from "echarts/types/dist/shared";
import { MIN_GRAPH_HEIGHT } from "./utils";
import { TOOLTIP_POSITION } from "./ForecastSnowGraph";
import { useSettings } from "~/common/components/map/useSettings";
import { Echarts } from "~/common/components/echarts";
import { EChartsOption } from "echarts";

export const ForecastWindGraph = ({
  dates,
  low,
  high,
  gusts,
}: {
  low: number[] | undefined;
  high: number[] | undefined;
  gusts: (number | null)[] | undefined;
} & ({ dates: Date[] } | { dates: string[] } | { dates: undefined })) => {
  const { units } = useSettings();
  if (!dates || !low) return null;

  // adjust gusts to be relative to high wind speeds
  const adjustedGusts =
    gusts?.map((gust, index) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      gust !== null && high ? Math.max(gust - high[index]! ?? 0, 0) : null
    ) || [];
 

  return (
    <Echarts
    group="forecast"
      option={{
        grid: { top: 8, right: 8, bottom: 17, left: 40 },
        visualMap: [
          {
            show: false,
            type: "continuous",
            min: 0,
            max: 60,
            seriesIndex: 0,
            inRange: {
              color: [
                GRAY[100],
                GRAY[300],
                YELLOW[500],
                YELLOW[500],
                RED[300],
                RED[500],
              ],
            },
            outOfRange: {
              color: RED[700],
            },
          },
          {
            show: false,
            type: "continuous",
            min: 0,
            max: 60,
            seriesIndex: 1,
            inRange: {
              color: [
                GRAY[100],
                GRAY[300],
                YELLOW[500],
                YELLOW[500],
                RED[300],
                RED[500],
              ],
            },
            outOfRange: {
              color: RED[700],
            },
          },
        ],
        xAxis: {
          type: "category",
          data: getDisplayDates(dates),
          axisLabel: {
            fontWeight: "bolder",
            fontSize: 8,
          },
        },
        yAxis: {
          type: "value",
          interval: 10,
          axisLabel: {
            formatter: (value: number) =>
              units === "imperial" ? `${value}{a|mph}` : `${value}{a|km/h}`,
            rich: {
              a: {
                color: GRAY[500],
                fontSize: 8,
                fontWeight: "lighter",
                verticalAlign: "bottom",
              },
            },
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: function (params):string {
            const typedParams = params as {
              name: string;
              value: number;
              marker: string;
            }[];
            const lowWindObj = typedParams[0];
            const highWindObj = typedParams[1];
            const gustsObj = typedParams[2];

            if (!lowWindObj || !highWindObj) return  "";

            const date = lowWindObj?.name;
            const lowWind = lowWindObj?.value;
            const highWind = highWindObj?.value;
            const gusts = gustsObj?.value;

            let windString =
              lowWind === highWind
                ? `Winds <strong>${lowWind} ${
                    units === "imperial" ? "mph" : "km/h"
                  }</strong>`
                : `Winds <strong>${lowWind}-${highWind} ${
                    units === "imperial" ? "mph" : "km/h"
                  }</strong>`;

            if (gusts)
              windString += `, gusts up to <strong>${Math.max(
                gusts + highWind
              )} ${units === "imperial" ? "mph" : "km/h"}</strong>`;

            return `<div style="min-width:200px;">
            ${date}<br/>
            ${highWindObj.marker} ${windString}
        </div>`;

              
          },
        },
        series: [
          {
            data: low,
            type: "line",
            smooth: true,
            showSymbol: false,
            name: "low-wind",
          },
          {
            data: high,
            type: "line",
            smooth: true,
            showSymbol: false,
            stack: "gusts",
            name: "high-wind",
          },
          {
            data: adjustedGusts as number[],
            type: "bar",
            barWidth: 10,
            stack: "gusts",
            colorBy: "series",
            itemStyle: { color: RED[600], borderRadius: 4, opacity: 0.7 },
            name: "gusts",
          },
        ],
      }}
      style={{ height: "100%", minHeight: MIN_GRAPH_HEIGHT }}
    />
  );
};
