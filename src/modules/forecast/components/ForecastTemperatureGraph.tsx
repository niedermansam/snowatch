import React from "react";
import SChart from "~/common/components/SChart";
import {
  GRAY,
  YELLOW,
  RED,
  INDIGO,
  BLUE,
  PURPLE,
} from "~/common/styles/ColorPalette";

function ForecastTemperatureGraph({
  temps,
  dates,
}: {
  temps: number[];
  dates: string[];
}) {
  const options = {
    grid: { top: 8, right: 8, bottom: 20, left: 40 },
    tooltip: {
      trigger: "axis",

      axisPointer: {
        type: "shadow",
      },

      formatter: (
        params: {
          name: string;
          value: number;
          marker: string;
          axisValue: string;
        }[]
      ) => {
        const tempParams = params[0];
        if (!tempParams) return "";
        return `${tempParams.marker} ${tempParams.value}°F on ${tempParams.axisValue}`;
      },
    },
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
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: {
        fontWeight: "bolder",
        fontSize: 8,
      },
    },
    yAxis: {
      type: "value",
      minInterval: 10,
      axisLabel: {
        formatter: (value: number) => `${value}{a|°F}`,
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
    series: [
      {
        name: "Low",
        type: "line",
        data: temps,
        smooth: true,
        showSymbol: false,
      },
    ],
  };

  return <SChart option={options} style={{ height: "100%" }} />;
}

export default ForecastTemperatureGraph;
