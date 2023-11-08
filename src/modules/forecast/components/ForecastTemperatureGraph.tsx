
import React, { useEffect } from 'react'
import SChart from '~/common/components/SChart';
import type ReactEChartsCore from "echarts-for-react/lib/core";
import {  RED, INDIGO, PURPLE } from '~/common/styles/ColorPalette';
import * as echarts from 'echarts/core';

type ForecastTemperatureGraphProps = {
    temps: number[];
    dates: string[];
    group?: string;
}

const ForecastTemperatureGraph = React.forwardRef<ReactEChartsCore , ForecastTemperatureGraphProps >(function ForecastTemperatureGraph({
    temps,
    dates,
    group
}: {
    temps: number[];
    dates: string[];
    group?: string;
}, ref) {

  // const chartRef = React.useRef<ReactEChartsCore>(null);

  // const [instance, setInstance] = React.useState<ECharts | null>(null);




    const options = {
      grid: { top: 8, right: 8, bottom: 20, left: 36 },
      group: 'forecast',
      tooltip: {
        trigger: "axis",
        formatter: (params:  {
            name: string;
            value: number;
            marker: string;
            axisValue: string;
        }[]
        ) => {
            const tempParams = params[0]
            if(!tempParams) return ''
            return `${tempParams.marker} ${tempParams.value}°F on ${tempParams.axisValue}`;
            },
            axisPointer: {
              type: 'shadow'
            }
         
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
        axisLabel: {
          fontWeight: "bolder",
          fontSize: 8,
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

  return (
    <SChart group={group} ref={ref} option={options} style={{ height: 150 }} onEvents={{
      'rendered': () => {
       if(group) echarts.connect(group)
      }
    }} />
  )
})

export default ForecastTemperatureGraph