"use client";
import React from "react";
import type { UseForecastReturn } from "~/common/components/hooks/useForecast";
import { WiStrongWind, WiThermometer } from "react-icons/wi";
import SnowflakeIcon from "~public/snowflake64.png";
import Image from "next/image";

export function ForecastDetails({ forecast }: { forecast: UseForecastReturn }) {
  if (forecast.isLoading) return null;
  if (forecast.isError) return null;

  return (
    <div className="mt-8 flex flex-col">
      <h3 className="text-lg font-bold">Detailed Forecast</h3>
      {forecast.data?.snow.data.map((period) => {
        return (
          <div key={period.startTime.toISOString()}>
            <div className="grid grid-cols-[1fr_20%] gap-2">
              <div className="flex flex-col">
                <div className=" grid grid-cols-2 justify-between font-bold sm:pr-6 ">
                  {" "}
                  <p>{period.name}</p>
                  <div className="flex gap-x-1 place-self-end">
                    {period.lowSnow > 0 ? (
                      <span className="flex gap-x-1">
                        <Image
                          src={SnowflakeIcon}
                          alt="snow"
                          width={24}
                          height={24}
                          style={{
                            filter:
                              "drop-shadow( 3px 3px 2px rgba(0, 0, 0, .15))",
                            maxHeight: "24px",
                          }}
                          fill={false}
                          className="h-[24px]!  inline"
                        />
                        {period.lowSnow}
                        {period.highSnow && period.highSnow !== period.lowSnow
                          ? ` - ${period.highSnow}"`
                          : '"'}
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
