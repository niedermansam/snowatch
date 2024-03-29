import SChart from "~/common/components/SChart";
import { getDisplayDates } from "../utils/getDisplayDates";
import { GRAY, RED, YELLOW } from "~/common/styles/ColorPalette";
import type { ECBasicOption } from "echarts/types/dist/shared";
import { MIN_GRAPH_HEIGHT } from "./utils";
import { TOOLTIP_POSITION } from "./ForecastSnowGraph";

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
  if (!dates || !low) return null;

  const options: ECBasicOption = {
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
        formatter: (value: number) => `${value}{a|mph}`,
        rich: {
          a: {
            color: GRAY[500],
            fontSize: 8,
            fontWeight: "lighter",
            verticalAlign: "bottom",
          },
        }
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      position: TOOLTIP_POSITION,
      formatter: function (
        params: { name: string; value: number; marker: string  }[]
      ) {
        const lowWindObj = params[0];
        const highWindObj = params[1];
        const gustsObj = params[2];

        if (!lowWindObj || !highWindObj) return null;

        const date = lowWindObj?.name;
        const lowWind = lowWindObj?.value;
        const highWind = highWindObj?.value;
        const gusts = gustsObj?.value;

        let windString =
          lowWind === highWind
            ? `Winds <strong>${lowWind} mph</strong>`
            : `Winds <strong>${lowWind}-${highWind} mph</strong>`;

        if (gusts)
          windString += `, gusts up to <strong>${
            gusts + highWind
          } mph</strong>`;

        return `<div style="width:50vw; max-width:400px">
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
        data: gusts,
        type: "bar",
        barWidth: 10,
        stack: "gusts",
        colorBy: "series",
        itemStyle: { color: RED[600], borderRadius: 4, opacity: 0.7 },
        name: "gusts",
      },
    ],
  };

  return (
    <SChart
      option={options}
      style={{ height: "100%", minHeight: MIN_GRAPH_HEIGHT }}
    />
  );
};
