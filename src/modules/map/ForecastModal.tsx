"use client";
import React from "react";
import { Forecast } from "~/modules/forecast/hooks/useForecast";
import { METERS_TO_FEET } from "~/common/utils/units";
import ReactModal from "react-modal";
import { useNearbySnotel } from "../snotel/hooks/useSnotel";
import ForecastSnowGraph from "../forecast/components/ForecastSnowGraph";
import { ForecastWindGraph } from "../forecast/components/ForecastWindGraph";
import ForecastTemperatureGraph from "../forecast/components/ForecastTemperatureGraph";
import { DESKTOP_NAVBAR_HEIGHT } from "~/common/components/NavBar";
import ModalMap from "./ModalMap";

export function ForecastModal({ forecastData }: { forecastData: Forecast }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      width: "80%",
      height: "85%",
      bottom: "auto",
      marginRight: "-50%",
      transform: `translate(-50%,  calc(-50% + ${
        DESKTOP_NAVBAR_HEIGHT / 2
      }px))`,
      zIndex: 1200,
      overflow: "visible",
      cursor: 'auto',
      borderRadius: "0.5rem",
    },
    overlay: {
      zIndex: 1150,
      backdropFilter: "blur(1px)",
      backgroundColor: "rgba(0,0,0,0.25)",
      cursor: "pointer",
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
        {isOpen && (
          <div className="flex h-full flex-col gap-y-4 text-sw-gray-500">
            <div className="-mb-10 flex h-[20%] justify-between">
              <div>
              
                <h2 className="text-lg font-bold leading-none">Forecast</h2>
                <p className="text-xs font-light">
                  {forecastData.metadata.getRelativeLocation()}
                  </p>
              </div>
              <div className="hidden h-full w-1/3 overflow-hidden rounded-md sm:block">
                <ModalMap geohash={forecastData.geohash} />
              </div>
            </div>
            <div className="h-1/4 pb-2">
              <h3 className="text-sm font-bold leading-none">Snow</h3>
              <p className="pb-1 text-[0.7rem] font-light text-sw-gray-700">
                {forecastData.snow.total}{" "}
                {forecastData.snow.total !== "No snow" && "of snow "}
                expected before {forecastData.metadata.getLastPeriodName()}
              </p>
              <ForecastSnowGraph
                lowDaily={forecastData.snow.getLowSnowArray()}
                highDaily={forecastData.snow.getHighSnow(true)}
                lowCumulative={forecastData.snow.getCumulativeLowSnow()}
                highCumulative={forecastData.snow.getCumulativeHighSnow()}
                dates={forecastData.getDateLabels()}
              />
            </div>
            <div className="h-1/4 py-4">
              <h3 className="text-sm font-bold leading-none">Wind</h3>
              <p className="pb-1 text-[0.7rem] font-light text-sw-gray-700">
                {windiestPeriod.gusts ? "Gusts" : "Winds"} up to{" "}
                {windiestPeriod.gusts || windiestPeriod.high}mph{" "}
                {windiestPeriod.period}.
              </p>
              <ForecastWindGraph
                dates={forecastData.getDateLabels()}
                low={forecastData.wind.getLowWind()}
                high={forecastData.wind.getHighWind()}
                gusts={forecastData.wind.getGusts("stacked")}
              />
            </div>
            <div className="h-1/4 py-4">
              <h3 className="text-sm font-bold">Temperature</h3>
              <p className="pb-1 text-[0.7rem] font-light text-sw-gray-700">
                High of {warmerstPeriod.temperature}&deg;F expected{" "}
                {warmerstPeriod.period
                  .replace("This", "this")
                  .replace("Afternoon", "afternoon")
                  .replace("Evening", "evening")}
                .
              </p>
              <ForecastTemperatureGraph
                temps={forecastData.temperature.getTemperature()}
                dates={forecastData.getDateLabels()}
              />
            </div>
          </div>
        )}
      </ReactModal>
    </>
  );
}
