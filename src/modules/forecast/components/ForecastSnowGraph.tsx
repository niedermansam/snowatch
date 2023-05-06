"use client";
import React from "react";
import ReactECharts from "echarts-for-react";

function getDisplayDates(dates: Date[] | string[]):string[] {
  if (dates[0] instanceof Date) {
    const out=  dates.map(x => (x as Date).toLocaleDateString());

    return out;
  } else {
    return dates as string[];
  }
}

const SnowForecastGraph = ({
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
} & ({
  dates: Date[];
} | {
  dates: string[];
} | {
  dates: undefined;
})) => {
  if (!dates || !lowDaily) return null;


  const options = {
    grid: { top: 8, right: 8, bottom: 90, left: 36 },
    xAxis: {
      type: "category",
      data: getDisplayDates(dates),
      axisLabel: {
        fontWeight: "bolder",
        fontSize: 8,
      }
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: lowDaily,
        type: "bar",
        stack: "daily",
      },
      {
        data: highDaily,
        type: "bar",
        stack: "daily",
      },
      {
        data: lowCumulative,
        type: "line",
        smooth: true,
      },
      {
        data: highCumulative,
        type: "line",
        smooth: true,
      },
    ],
    tooltip: {
      trigger: "axis",
    },
  };

  return <ReactECharts option={options} />;
};

export default SnowForecastGraph;
