declare module "*.css" {
  const content: string;
  export default content;
}

declare module "leaflet/dist/leaflet.css";


declare module "weather-icons-react" {
  import * as React from "react";

  interface WeatherIconProps {
    name: string;
    size?: number;
    color?: string;
    style?: React.CSSProperties;
    className?: string;
  }

  export default class WeatherIcon extends React.Component<WeatherIconProps> {}
}