"use client";
import React from "react";
import SChart from "~/common/components/SChart";
import { getDisplayDates } from "../utils/getDisplayDates";
import { BLUE } from "~/common/styles/ColorPalette";

function uncapitalizePeriodLabel(period: string) {
  const newPeriod = period
    .replace("Night", "night")
    .replace("Tonight", "tonight");
  newPeriod.replace("This", "this");
  newPeriod.replace("Tonight", "tonight");
  newPeriod.replace("Today", "today");
  newPeriod.replace("Tomorrow", "tomorrow");
  newPeriod.replace("Morning", "morning");
  newPeriod.replace("Afternoon", "afternoon");
  newPeriod.replace("Evening", "evening");

  return newPeriod;
}

export const ForecastSnowGraph = ({
  dates,
  lowDaily,
  highDaily,
  lowCumulative,
  highCumulative,
}: {
  lowDaily: number[] | undefined;
  highDaily: number[] | undefined;
  lowCumulative: number[] | undefined;
  highCumulative: number[] | undefined;
} & (
  | {
      dates: Date[];
    }
  | {
      dates: string[];
    }
  | {
      dates: undefined;
    }
)) => {
  if (!dates || !lowDaily) return null;

  const options = {
    grid: { top: 8, right: 8, bottom: 20, left: 36 },
    //  visualMap: {
    //     show: false,
    //     type: 'continuous',
    //     min: 0,
    //     max: 400
    // },
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
    },
    series: [
      {
        data: lowDaily,
        type: "bar",
        stack: "daily",
        color: BLUE[700],
        itemStyle: {
          opacity: 0.8,
        },
      },
      {
        data: highDaily,
        type: "bar",
        stack: "daily",
        color: BLUE[500],
        itemStyle: {
          opacity: 0.6,
        },
      },
      {
        data: lowCumulative,
        type: "line",
        smooth: true,
        color: BLUE[700],
        showSymbol: false,
        itemStyle: {
          opacity: 0.8,
        },
      },
      {
        data: highCumulative,
        type: "line",
        smooth: true,
        showSymbol: false,
        color: BLUE[500],
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: (
        params: {
          name: string;
          value: number;
          marker: string;
          dataIndex: number;
        }[]
      ) => {
        const lowDailyObj = params[0];
        const highDailyObj = params[1];
        const lowCumulativeObj = params[2];
        const highCumulativeObj = params[3];

        if (!lowDailyObj || !highDailyObj) return null;

        const dataIndex = lowDailyObj?.dataIndex;

        const date = lowDailyObj?.name;

        const lowDaily = lowDailyObj?.value;
        const highDaily = highDailyObj?.value;
        const lowCumulative = lowCumulativeObj?.value;
        const highCumulative = highCumulativeObj?.value;

        const dailyString =
           highDaily === 0
            ? `<strong>${lowDaily}"</strong> expected ${uncapitalizePeriodLabel(
                date
              )}`
            : `<strong>${lowDaily}-${highDaily + lowDaily}"</strong> expected ${uncapitalizePeriodLabel(
                date
              )}`;

        let cumulativeString = "";

        if (lowCumulative && highCumulative) {
          cumulativeString =
            lowCumulative === highCumulative
              ? `<strong>${lowCumulative}"</strong> cumulative`
              : `<strong>${lowCumulative}-${highCumulative}"</strong> cumulative snowfall`;
        }

        return `<div>
            ${dailyString}
            ${(dataIndex !== 0 && "<br/>" + cumulativeString) || ""}
        </div>`;
      },
    },
  };

  return (
    <SChart
      option={options}
      style={{
        height: 150,
      }}
    />
  );
};

export default ForecastSnowGraph;
