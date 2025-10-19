"use client";
import { useLocalStorage } from "usehooks-ts";

export const useSettings = () => {
  const [units, setUnits] = useLocalStorage<"metric" | "imperial">(
    "units",
    "imperial"
  );
  return { units, setUnits };
};
