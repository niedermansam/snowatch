"use client";
import { UnitConverter } from "~/app/UnitConverter";

function getTotalSnowString(
  totalCm: number | undefined | null,
  units: "metric" | "imperial",
  withUnits = true
) {
  if (units === "metric") {
    return withUnits
      ? `${totalCm?.toFixed(0) ?? 0} <span class='snow-units'>cm</span>`
      : totalCm?.toFixed(0);
  }
  return withUnits
    ? `${UnitConverter.cmToInches(totalCm ?? 0).toFixed(
        0
      )} <span class='snow-units'>in</span>`
    : UnitConverter.cmToInches(totalCm ?? 0).toFixed(0);
}

export function getSnowRangeString(
  min: number | null | undefined,
  max: number | null | undefined,
  units: "metric" | "imperial"
) {
  if (!min || !max) return `${getTotalSnowString(min, units) ?? 0}`;
  if (min === max) return `${getTotalSnowString(min, units) ?? 0}`;
  return `${getTotalSnowString(min, units, false) ?? 0}-${
    getTotalSnowString(max, units) ?? 0
  }`;
}
