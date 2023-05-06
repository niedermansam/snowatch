import type { forecast, forecastDiscussion } from "~/utils/test";

export type NoaaMetadata = (typeof forecast)["metadata"];

export type NoaaForecast = (typeof forecast)["forecast"];

export type NoaaHourlyForecast = (typeof forecast)["hourlyForecast"];

export type NoaaForecastDiscussionMetadata =
  (typeof forecastDiscussion)["metadata"];

export type NoaaForecastDiscussion = (typeof forecastDiscussion)["discussion"];
