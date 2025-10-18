"use client";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

export function useForecastList() {
  const [forecasts, setForecasts] = useQueryState(
    "forecasts",
    parseAsArrayOf(parseAsString),
  );

  function removeForecast(hash: string) {
    if (!forecasts) return;
    const newForecasts = forecasts.filter((f) => f !== hash);
    setForecasts(newForecasts).catch(console.error);
  }

  function addForecast(hash: string) {
    if (!forecasts) return setForecasts([hash]);
    const newForecasts = [...forecasts, hash];
    setForecasts(newForecasts).catch(console.error);
  }

  return { forecasts, setForecasts, removeForecast, addForecast };
}
