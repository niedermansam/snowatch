"use client";
import React from "react";
import { Forecast } from "~/modules/forecast/hooks/useForecast";
import { METERS_TO_FEET } from "~/common/utils/units";
import ReactModal from "react-modal";

export function ForecastModal({ forecastData }: { forecastData: Forecast }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      width: "50%",
      height: "50%",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
    overlay: {
      zIndex: 11150,
    },
  };

  if (forecastData.isLoading) return null;
  if (forecastData.isError) return null;

  const windiestPeriod = forecastData.wind.getWindiestPeriod();

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
        {forecastData.snow.total} expected at{" "}
        {forecastData.elevation || 0 * METERS_TO_FEET} meters
        <div>
          {windiestPeriod.gusts ? "Gusts" : "Winds"} up to{" "}
          {windiestPeriod.gusts || windiestPeriod.high} mph on{" "}
          {windiestPeriod.period}
        </div>
      </ReactModal>
    </>
  );
}
