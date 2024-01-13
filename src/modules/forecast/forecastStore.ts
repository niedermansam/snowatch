import { useRouter } from "next/navigation";
import { create } from "zustand";
import { createUrl } from "../map/ForecastMap";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type forecastDispatch =
  | {
      type: "ADD";
      payload: string;
    }
  | {
      type: "REMOVE";
      payload: string;
    }
  | {
      type: "SET";
      payload: string[];
    }
  | {
      type: "RESET";
    };

const forecastReducer = (state: string[], action: forecastDispatch) => {
  switch (action.type) {
    case "ADD": 
      return [ action.payload, ...state].splice(0, 5);
    case "REMOVE": 
      return state.filter((f) => f !== action.payload);
    case "SET": 
      return action.payload;
    case "RESET": 
      return [];
    default:
      return state;
  }
};

type MapStore = {
  forecasts: string[];
  forecastDispatch: (action: forecastDispatch) => void;
  initialize: () => void;
  //   addForecast: (forecast: string[]) => void;
  //   resetForecasts: () => void;
  //   removeForecast: (forecast: string) => void;
  //   setForecasts: (forecasts: string[]) => void;
};

export const useMapStore = create<MapStore>((set) => {
  return {
    forecasts: [],
    forecastDispatch: (action) =>
      set((state) => ({ forecasts: forecastReducer(state.forecasts, action) })),
    initialize: () =>set(() => {
      const urlForecasts = new URLSearchParams(window.location.search).get(
        "locations"
      )?.split(",");

      return {forecasts: urlForecasts}
    }),


    // addForecast: (forecast) =>
    //   set((state) => ({ forecasts: [...state.forecasts, ...forecast] })),
    // resetForecasts: () => set({ forecasts: [] }),
    // removeForecast: (forecast) =>
    //   set((state) => ({
    //     forecasts: state.forecasts.filter((f) => f !== forecast),
    //   })),
    // setForecasts: (forecasts) => set({ forecasts }),
  };
});

export const useMapUrl = () => {
  const router = useRouter();
  const { forecasts } = useMapStore(); 

  
 
 
  const forecastUrl = createUrl({
    locations: forecasts,
  });
 


  return { update:  () => router.replace(forecastUrl) };
};
