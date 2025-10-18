"use client";
import React from "react";

export const PrettifiedLatLon = ({
  position,
}: {
  position: [number, number];
}) => {
  const latSign = position[0] > 0 ? "N" : "S";
  const lonSign = position[1] > 0 ? "E" : "W";

  return (
    <>
      {Math.abs(position[0]).toFixed(4)}°{latSign},{" "}
      {Math.abs(position[1]).toFixed(4)}°{lonSign}
    </>
  );
};
