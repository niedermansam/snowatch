
import React from 'react'
import SChart from '~/common/components/SChart';

function ForecastTemperatureGraph({
    lows,
    highs,
    dates
}: {
    lows: number[];
    highs: number[];
    dates: string[];
}) {

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
                data: lows,
                smooth: true,
            },
            {
                name: "High",
                type: "line",
                data: highs,
                smooth: true,
            },
        ],
    };

  return (
    <SChart option={options} style={{ height: 150 }} />
  )
}

export default ForecastTemperatureGraph