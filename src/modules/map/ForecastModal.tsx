"use client";
import React from "react";
import type {
  UseForecastData,
  UseForecastReturn,
} from "~/modules/forecast/hooks/useForecast";
import ReactModal from "react-modal";
import ForecastSnowGraph from "../forecast/components/ForecastSnowGraph";
import { ForecastWindGraph } from "../forecast/components/ForecastWindGraph";
import ForecastTemperatureGraph from "../forecast/components/ForecastTemperatureGraph";
import { DESKTOP_NAVBAR_HEIGHT } from "~/common/components/NavBar";
import ModalMap from "./ModalMap";
import Forecast from "../forecast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForecastDiscussionSection } from "../forecast/components/ForecastDiscussionSection";
import { ForecastDetails } from "../forecast/components/ForecastDetails";
import { SnotelSection } from "./SnotelSection";

export function ForecastModal({
  forecastData,
}: {
  forecastData: UseForecastReturn;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const customStyles = {
    content: {
      width: "80%",
      height: "85%",
      zIndex: 1200,

      cursor: "auto",
      borderRadius: "0.5rem",
      margin: "auto",
    },
    overlay: {
      zIndex: 1050,
      // backdropFilter: "blur(1px)",
      backgroundColor: "rgba(0,0,0,0.25)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      top: DESKTOP_NAVBAR_HEIGHT,
    },
  } satisfies ReactModal.Styles;

  if (forecastData.isLoading) return null;
  if (forecastData.isError) return null;
  if (!forecastData.data) return null;

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
            <ModalHeader data={forecastData.data} />
            <Tabs defaultValue="forecast" className="h-full w-full">
              <TabsList>
                <TabsTrigger value="forecast">Graphs</TabsTrigger>
                <TabsTrigger value="discussion">Details</TabsTrigger>
                <TabsTrigger value="snotel">Snotel</TabsTrigger>
              </TabsList>
              <TabsContent value="forecast">
                <ModalForecastBody data={forecastData.data} />
              </TabsContent>
              <TabsContent value="discussion">
                <div className="grid lg:grid-cols-2 gap-4">
                  <ForecastDiscussionSection
                    office={forecastData.data.office}
                  />
                  <ForecastDetails forecast={forecastData} />
                </div>
              </TabsContent>
              <TabsContent value="snotel">
                <SnotelSection geohash={forecastData.data.geohash} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </ReactModal>
    </>
  );
}

function ModalHeader({
  data,
}: {
  data: NonNullable<UseForecastReturn["data"]>;
}) {
  return (
    <div className="-mb-10 flex h-[100px] min-h-[100px] justify-between">
      <div>
        <h2 className="text-lg font-bold leading-none">Forecast</h2>
        <p className="text-xs font-light">
          {data.metadata.getRelativeLocation()}
        </p>
      </div>
      <div className="-mb-12 hidden w-1/3 overflow-hidden rounded-md sm:block lg:w-1/2">
        <ModalMap geohash={data.geohash} />
      </div>
    </div>
  );
}

function ModalForecastBody({
  data,
}: {
  data: NonNullable<UseForecastReturn["data"]>;
}) {
  const windiestPeriod = data.wind.getWindiestPeriod();
  const warmerstPeriod = data.temperature.getHottestPeriod();

  return (
    <div className="h-full px-2">
      <div className="h-1/4 min-h-[200px] pb-2 ">
        <h3 className="text-sm font-bold leading-none">Snow</h3>
        <p className="pb-1 text-[0.7rem] font-light text-sw-gray-700">
          {data.snow.total} {data.snow.total !== "No snow" && "of snow "}
          expected before {data.metadata.getLastPeriodName()}
        </p>
        <ForecastSnowGraph
          lowDaily={data.snow.getLowSnowArray()}
          highDaily={data.snow.getHighSnow(true)}
          lowCumulative={data.snow.getCumulativeLowSnow()}
          highCumulative={data.snow.getCumulativeHighSnow()}
          dates={data.getDateLabels()}
        />
      </div>
      <div className="h-1/4 py-4">
        <h3 className="text-sm font-bold leading-none">Wind</h3>
        <p className="pb-1 text-[0.7rem] font-light text-sw-gray-700">
          {windiestPeriod.gusts ? "Gusts" : "Winds"} up to{" "}
          {windiestPeriod.gusts || windiestPeriod.highSnow}mph{" "}
          {windiestPeriod.period}.
        </p>
        <ForecastWindGraph
          dates={data.getDateLabels()}
          low={data.wind.getLowWind()}
          high={data.wind.getHighWind()}
          gusts={data.wind.getGusts("stacked")}
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
          temps={data.temperature.getTemperature()}
          dates={data.getDateLabels()}
        />
      </div>
    </div>
  );
}
