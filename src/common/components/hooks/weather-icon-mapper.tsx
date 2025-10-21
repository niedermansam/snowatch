// weatherIconMapper.tsx
import React from "react";
import {
  WiDaySunny,
  WiNightClear,
  WiDayCloudy,
  WiNightAltCloudy,
  WiCloudy,
  WiFog,
  WiDayHaze,
  WiDayRain,
  WiNightAltRain,
  WiDayShowers,
  WiNightAltShowers,
  WiThunderstorm,
  WiSnow,
  WiSleet,
  WiDaySprinkle,
  WiNightAltSprinkle,
  WiStrongWind,
} from "react-icons/wi";
import type { IconType } from "react-icons";

interface WeatherIconProps {
  size?: number;
  className?: string;
}

export function WeatherIcon({
  shortForecast,
  isDaytime,
  size = 48,
  className = "",
  ...props
}: {
  shortForecast: string;
  isDaytime: boolean;
  size?: number;
  className?: string;
  props?: WeatherIconProps;
}) {
  const forecast = shortForecast.toLowerCase();

  // Core mapping to React components
  const conditions: { [key: string]: IconType } = {
    clear: isDaytime ? WiDaySunny : WiNightClear,
    sunny: WiDaySunny,
    cloudy: isDaytime ? WiDayCloudy : WiNightAltCloudy,
    overcast: WiCloudy,
    fog: WiFog,
    haze: WiDayHaze,
    rain: isDaytime ? WiDayRain : WiNightAltRain,
    showers: isDaytime ? WiDayShowers : WiNightAltShowers,
    thunderstorm: WiThunderstorm,
    snow: WiSnow,
    sleet: WiSleet,
    drizzle: isDaytime ? WiDaySprinkle : WiNightAltSprinkle,
    wind: WiStrongWind,
  };

  // Try to match the forecast text to a condition keyword
  const key = Object.keys(conditions).find((k) => forecast.includes(k));

  const IconComponent =
    (key && conditions[key]) || (isDaytime ? WiDaySunny : WiNightClear);

  return <IconComponent size={size} className={className} 
    {...props}
  />;
}
