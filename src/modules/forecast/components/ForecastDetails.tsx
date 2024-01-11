"use client";
import React from "react";
import type { UseForecastReturn } from "~/modules/forecast/hooks/useForecast";
import { WiStrongWind, WiThermometer } from "react-icons/wi";
import SnowflakeIcon from "~public/snowflake64.png";
import Image from "next/image";

export function ForecastDetails({ forecast }: { forecast: UseForecastReturn }) {
  if (forecast.isLoading) return null;
  if (forecast.isError) return null;

  return (
    <div className="flex flex-col mt-8">
      <h3 className="text-lg font-bold">Detailed Forecast</h3>
      {forecast.data.snow.data.map((period) => {
        return (
          <div key={period.startTime.toISOString()}>
            <div className="grid grid-cols-[1fr_20%] gap-2">
              <div className="flex flex-col">
                <div className=" flex justify-between pr-6 font-bold">
                  {" "}
                  <p>{period.name}</p>
                  <div className="flex gap-x-1 ">
                    {period.lowSnow > 0 ? (
                      <span className="flex gap-x-1">
                        <Image
                          src={SnowflakeIcon}
                          alt="snow"
                          width={24}
                          fill={false}
                        />
                        {period.lowSnow}
                        {period.highSnow &&
                          period.highSnow !== period.lowSnow &&
                          ` - ${period.highSnow}"`}
                      </span>
                    ) : (
                      <span className="text-gray-200 opacity-10">
                        No Snow :(
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-light">{period.detailedForecast}</p>
              </div>
              <div className="flex flex-col gap-y-1">
                <p className="text-sm font-bold">
                  <WiThermometer className="inline h-4 w-4" />
                  {period.temperature}&deg;F {period.isDaytime ? "High" : "Low"}{" "}
                </p>
                <p className="text-xs font-bold"></p>
                <p className="text-xs font-light">
                  <WiStrongWind className="inline h-4 w-4" />
                  {period.windSpeed?.replace("to", "-")} <br />
                  {period.gusts && (
                    <>
                      <WiStrongWind className="inline h-4 w-4" />
                      {period.gusts} mph gusts
                    </>
                  )}
                </p>
              </div>
            </div>
            <hr className="col-span-2 my-2" />
          </div>
        );
      })}
    </div>
  );
}
