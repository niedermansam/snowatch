"use client";
import React from "react";
import type {
  UseForecastData,
  UseForecastReturn,
} from "~/modules/forecast/hooks/useForecast";
import ReactModal from "react-modal";
import { useNearbySnotel } from "../snotel/hooks/useSnotel";
import ForecastSnowGraph from "../forecast/components/ForecastSnowGraph";
import { ForecastWindGraph } from "../forecast/components/ForecastWindGraph";
import ForecastTemperatureGraph from "../forecast/components/ForecastTemperatureGraph";
import { DESKTOP_NAVBAR_HEIGHT } from "~/common/components/NavBar";
import ModalMap from "./ModalMap";
import Forecast from "../forecast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UseForecastDiscussion,
  useForecastDiscussion,
} from "../forecast/hooks/useForecastDiscussion";
import { DiscussionCombobox } from "./DiscussionCombobox";
import { Button } from "@/components/ui/button";

export function ForecastModal({
  forecastData,
}: {
  forecastData: UseForecastReturn;
}) {
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
      overflow: "scroll",
      cursor: "auto",
      borderRadius: "0.5rem",
    },
    overlay: {
      zIndex: 1150,
      backdropFilter: "blur(1px)",
      backgroundColor: "rgba(0,0,0,0.25)",
      cursor: "pointer",
    },
  };

  if (forecastData.isLoading) return null;
  if (forecastData.isError) return null;

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
              </TabsList>
              <TabsContent value="forecast">
                <ModalForecastBody data={forecastData.data} />
              </TabsContent>
              <TabsContent value="discussion">
                <ForecastDiscussionSection office={forecastData.data.office} />
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
      <div className="hidden h-full w-1/3 overflow-hidden rounded-md sm:block">
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
          {windiestPeriod.gusts || windiestPeriod.high}mph{" "}
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

function ForecastDiscussionSection({ office }: { office: string }) {
  const discussion = useForecastDiscussion(office);
  return (
    <div
      style={{
        whiteSpace: "pre-wrap",
      }}
    >
      <ForecastDiscussionText
        text={
          discussion.discussions.filter(
            (x) => x.data?.id === discussion.selectedId
          )[0]?.data?.productText
        }
      >
        <ForecastDiscussionSelector data={discussion} />
      </ForecastDiscussionText>
    </div>
  );
}

function ForecastDiscussionSelector({ data }: { data: UseForecastDiscussion }) {

  const currentIndex = data.metadata?.findIndex((x) => x.id === data.selectedId);

  const goToNext = () => {
    if (currentIndex === undefined) return;
    if (currentIndex === 0) return;
    data.setSelectedId(data.metadata?.[currentIndex - 1]?.id);
  }

  const goToPrevious = () => {
    if (currentIndex === undefined) return;
    if(!data.metadata) return;
    if (currentIndex === data.metadata.length - 1) return;
    data.setSelectedId(data.metadata?.[currentIndex + 1]?.id);
  }

  return (
    <div className="flex flex-col items-center gap-2 pb-4">
      <h3 className="col-span-2">Choose Forecast Discussion</h3>
      <div className="col-span-2">
        <DiscussionCombobox
          value={data.selectedId}
          setValue={data.setSelectedId}
          options={data.metadata}
        />
      </div>
      <div className="flex gap-4">
        <Button variant="secondary" className="w-24 " onClick={goToPrevious} disabled={
          currentIndex === undefined || !data.metadata || currentIndex === data.metadata.length - 1
        }>
          Previous
        </Button>
        <Button variant="secondary" className="w-24 " onClick={goToNext} disabled={
          currentIndex === undefined || currentIndex === 0
        }>
          Next
        </Button>
      </div>
    </div>
  );
}

function ForecastDiscussionText({
  text,
  children,
}: {
  text: string | undefined;
  children?: React.ReactNode;
}) {
  // const [meta, discussion] = text?.split(".DISCUSSION") || ["", ""];

  // const [_, _2, warnings] = meta?.split("\n\n") || ["", ""];

  // console.log(warnings);

  // console.log(discussion)
  return (
    <div
      className="max-w-xl"
      style={{
        whiteSpace: "pre-wrap",
      }}
    >
      {children}
      <p className="col-span-2">
        {text
          ?.replaceAll(/(^|\n)(?!\n)/g, " ")
          .replaceAll(/\n+/g, "\n\n")
          .replaceAll(/ +/g, " ")
          .replaceAll(/\n /g, "\n")}
      </p>
    </div>
  );
}
