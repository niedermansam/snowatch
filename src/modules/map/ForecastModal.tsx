"use client";
import React from "react";
import { Forecast } from "~/modules/forecast/hooks/useForecast";
import { METERS_TO_FEET } from "~/common/utils/units";
import ReactModal from "react-modal";
import { useNearbySnotel } from "../snotel/hooks/useSnotel";
import ForecastSnowGraph from "../forecast/components/ForecastSnowGraph";
import { ForecastWindGraph } from "../forecast/components/ForecastWindGraph";
import ForecastTemperatureGraph from "../forecast/components/ForecastTemperatureGraph";
import type ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";

export function ForecastModal({ forecastData }: { forecastData: Forecast }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const temperatureRef = React.useRef<ReactEChartsCore>(null);
  const snowRef = React.useRef<ReactEChartsCore>(null);


  

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      width: "80%",
      height: "80%",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      zIndex: 1200,
      overflow: "show",
    },
    overlay: {
      zIndex: 1150,
    },
  };

  const snotels = useNearbySnotel({
    enabled: forecastData.geohash !== undefined && isOpen,
    geohash: forecastData.geohash,
    n: 3,
  });

  if (forecastData.isLoading) return null;
  if (forecastData.isError) return null;

  const windiestPeriod = forecastData.wind.getWindiestPeriod();

  const warmerstPeriod = forecastData.temperature.getHottestPeriod();

  const elevation = forecastData.getElevation("F");

  return (
    <>
      <button
        className=" rounded border border-solid  border-sw-indigo-300 bg-sw-indigo-50 px-1 text-xs text-sw-indigo-400 hover:bg-sw-indigo-400 hover:text-white"
        onClick={() => setIsOpen(true)}
      >
        details
      </button>
      <ReactModal
        style={customStyles}
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        {isOpen && <>
          {forecastData.snow.total}{" "}
          {forecastData.snow.total !== "No snow" && "of snow "}
          expected at {elevation} ft.
          <ForecastSnowGraph
            lowDaily={forecastData.snow.getLowSnowArray()}
            highDaily={forecastData.snow.getHighSnow(true)}
            lowCumulative={forecastData.snow.getCumulativeLowSnow()}
            highCumulative={forecastData.snow.getCumulativeHighSnow()}
            dates={forecastData.getDateLabels()}
            ref={snowRef}
            group="forecast"
          />
          <div>
            {windiestPeriod.gusts ? "Gusts" : "Winds"} up to{" "}
            {windiestPeriod.gusts || windiestPeriod.high}mph{" "}
            {windiestPeriod.period}.
            <ForecastWindGraph
              dates={forecastData.getDateLabels()}
              low={forecastData.wind.getLowWind()}
              high={forecastData.wind.getHighWind()}
              gusts={forecastData.wind.getGusts("stacked")}
              group="forecast"
            />
          </div>
          <div>
            High temperature of {warmerstPeriod.temperature}&deg;F expected{" "}
            {warmerstPeriod.period
              .replace("This", "this")
              .replace("Afternoon", "afternoon")
              .replace("Evening", "evening")}
            .
            <ForecastTemperatureGraph
              ref={temperatureRef}
              temps={forecastData.temperature.getTemperature()}
              dates={forecastData.getDateLabels()}
              group="forecast"
            />
          </div>
        </>}
      </ReactModal>
    </>
  );
}
