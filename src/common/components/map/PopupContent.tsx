"use client";
import React, { useState } from "react";
import type { useForecastMetadata } from "../hooks/noaa/useForecastMetadata";
import type { useGridForecast } from "../hooks/noaa/useGridForecast";
import type { useDailyForecast } from "../hooks/noaa/useDailyForecast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { useForecastList } from "../hooks/noaa/useForecastList";
import { Cross2Icon } from "@radix-ui/react-icons";
import { DiscussionSection } from "./DiscussionSection";
import { Trash2Icon } from "lucide-react";
import { SnotelSection } from "./SnotelSection";
import { ForecastGraphs } from "./graphs/ForecastGraphs";
import { UnitConverter } from "~/app/UnitConverter";
import { useSettings } from "./useSettings";

function convertMetricForecastToImperial(text: string) {
  // Conversion constants
  const KMH_TO_MPH = 0.621371;
  const CM_TO_INCHES = 0.393701;
  const CELSIUS_TO_FAHRENHEIT_MULTIPLIER = 9 / 5;
  const CELSIUS_TO_FAHRENHEIT_OFFSET = 32;

  // replace written out numbers with digits
  text = text.replace(/one/g, "1");
  text = text.replace(/two/g, "2");
  text = text.replace(/three/g, "3");
  text = text.replace(/four/g, "4");
  text = text.replace(/five/g, "5");
  text = text.replace(/six/g, "6");
  text = text.replace(/seven/g, "7");
  text = text.replace(/eight/g, "8");
  text = text.replace(/nine/g, "9");
  text = text.replace(/ten/g, "10");

  // Convert temperature from Celsius to Fahrenheit in the first sentence
  text = text.replace(
    /(.*?)(a (high|low) (near|of|around))\s*(-?\d+(?:\.\d+)?)/i,
    (match, before, tempPrefix, _, _2, temp: string) => { 
      const fahrenheit =
        parseFloat(temp) * CELSIUS_TO_FAHRENHEIT_MULTIPLIER +
        CELSIUS_TO_FAHRENHEIT_OFFSET;
      return `${before as string}${tempPrefix as string} ${fahrenheit.toFixed(
        0
      )} °F`;
    }
  );

  // Convert wind speed from km/h to mph, including ranges (e.g., "9 to 17 km/h")
  text = text.replace(
    /(\d+(?:\.\d+)?)\s*to\s*(\d+(?:\.\d+)?)\s*km\/h\b/g,
    (match, kmh1: string, kmh2: string) => {
      const mph1 = parseFloat(kmh1) * KMH_TO_MPH;
      const mph2 = parseFloat(kmh2) * KMH_TO_MPH;
      return `${mph1.toFixed(0)} to ${mph2.toFixed(0)} mph`;
    }
  );

  // convert gusts from km/h to mph
  text = text.replace(
    /gust(s?) as high as (\d+)\s*km\/h\b/g,
    (match, s: string, kmh: string) => {
      const mph = parseFloat(kmh) * KMH_TO_MPH;
      return `gust${s} as high as ${mph.toFixed(0)} mph`;
    }
  );

  text = text.replace(/(\d+(?:\.\d+)?)\s*km\/h\b/g, (match, kmh: string) => {
    const mph = parseFloat(kmh) * KMH_TO_MPH;
    return `${mph.toFixed(0)} mph`;
  });

  // Convert snow accumulation from cm to inches, including "less than" phrases
  text = text.replace(
    /less than (\d+(?:(\.|,)\d+)?)\s*cm\b/g,
    (match, cm: string) => {
      const inches = parseFloat(cm) * CM_TO_INCHES;
      return `less than ${inches.toFixed(0)} inches`;
    }
  );
  text = text.replace(
    /(\d+(?:\.\d+)?)\s*to\s*(\d+(?:(\.|,)\d+)?)\s*cm\b/g,
    (match, cm1: string, cm2: string) => {
      const inches1 = parseFloat(cm1) * CM_TO_INCHES;
      const inches2 = parseFloat(cm2) * CM_TO_INCHES;
      return `${inches1.toFixed(0)} to ${inches2.toFixed(0)} inches`;
    }
  );
  text = text.replace(/(\d+(?:(\.|,)\d+)?)\s*cm\b/g, (match, cm: string) => {
    const inches = parseFloat(cm) * CM_TO_INCHES;
    return `${inches.toFixed(1)} inches`;
  });

  text = text.replace("1 inches", "1 inch");
  text = text.replace("0 inches", "0.5 inches");

  return text;
}

export const translateBearingToAbbreviation = (bearing: number | undefined) => {
  if (!bearing) return "";
  if (bearing >= 337.5 || bearing < 22.5) {
    return "N";
  } else if (bearing >= 22.5 && bearing < 67.5) {
    return "NE";
  } else if (bearing >= 67.5 && bearing < 112.5) {
    return "E";
  } else if (bearing >= 112.5 && bearing < 157.5) {
    return "SE";
  } else if (bearing >= 157.5 && bearing < 202.5) {
    return "S";
  } else if (bearing >= 202.5 && bearing < 247.5) {
    return "SW";
  } else if (bearing >= 247.5 && bearing < 292.5) {
    return "W";
  } else if (bearing >= 292.5 && bearing < 337.5) {
    return "NW";
  }
};

export const translateBearing = (bearing: number | undefined) => {
  if (!bearing) return "";
  if (bearing >= 337.5 || bearing < 22.5) {
    return "north";
  }
  if (bearing >= 22.5 && bearing < 67.5) {
    return "northeast";
  }
  if (bearing >= 67.5 && bearing < 112.5) {
    return "east";
  }
  if (bearing >= 112.5 && bearing < 157.5) {
    return "southeast";
  }
  if (bearing >= 157.5 && bearing < 202.5) {
    return "south";
  }
  if (bearing >= 202.5 && bearing < 247.5) {
    return "southwest";
  }
  if (bearing >= 247.5 && bearing < 292.5) {
    return "west";
  }
  if (bearing >= 292.5 && bearing < 337.5) {
    return "northwest";
  }
};

type PopupProps = {
  hash: string;
  dailyForecast: ReturnType<typeof useDailyForecast>;
  // forecast: ReturnType<typeof useGridForecast>;
  meta: ReturnType<typeof useForecastMetadata>;
  coords: { lat: number; lon: number };
};
export function PopupContent({
  hash,
  dailyForecast: forecast,
  // forecast,
  meta,
  coords,
}: PopupProps) {
  const { units } = useSettings();
  const { removeForecast } = useForecastList();
  const [tab, setTab] = useState<
    "graphs" | "details" | "discussion" | "snotel" | undefined
  >();

  if (!forecast.data?.properties) return null;

  const elevation = forecast.data?.properties.elevation.value;

  if (!elevation) return "Loading...";

  const elevationString =
    units === "metric"
      ? `${elevation.toFixed(0)} m`
      : `${UnitConverter.metersToFeet(elevation).toFixed(0)} ft`;

  const relativeLocation = meta.data?.properties.relativeLocation.properties;

  const distance = relativeLocation?.distance.value ?? 0;

  const relativeLocationString = `${
    units === "imperial"
      ? UnitConverter.metersToMiles(distance).toFixed(1)
      : (distance / 1000).toFixed(1)
  } 
    ${units === "imperial" ? "miles" : "km"}  ${UnitConverter.translateBearing(
    relativeLocation?.bearing.value
  )} of ${relativeLocation?.city ?? ""}, ${relativeLocation?.state ?? ""}`;

  return (
    <div className="-mx-3 -mt-4 flex flex-col text-xs">
      <p className=" ">
        {relativeLocationString} at {elevationString}
      </p>
      <div className="-mt-2 flex w-full justify-end gap-2">
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            removeForecast(hash);
          }}
          variant={"destructive"}
          size={"icon-sm"}
        >
          <Trash2Icon className="h-1 w-1" />
        </Button>
        <Dialog
          open={!!tab}
          onOpenChange={(open) => {
            if (tab) setTab(undefined);
          }}
        >
          {/* overlay */}
          <Button
            variant={"outline"}
            className="font-noraml text-2xs h-fit w-fit p-1 px-2"
            onClick={() => {
              setTab("graphs");
            }}
          >
            graphs
          </Button>

          <Button
            variant={"outline"}
            className="font-noraml text-2xs h-fit w-fit p-1 px-2"
            onClick={() => {
              setTab("details");
            }}
          >
            details
          </Button>

          <Button
            variant={"outline"}
            className="font-noraml text-2xs h-fit w-fit p-1 px-2"
            onClick={() => {
              setTab("discussion");
            }}
          >
            discussion
          </Button>
          <Button
            variant={"outline"}
            className="font-noraml text-2xs h-fit w-fit p-1 px-2"
            onClick={() => {
              setTab("snotel");
            }}
          >
            snotel
          </Button>
          <DialogContent className="rounded-none! z-[1050] flex  h-[80vh] max-w-4xl flex-col p-0">
            <Tabs defaultValue={tab} className="w-full overflow-y-scroll px-3 h-full">
              <DialogHeader className="sticky top-0 z-[1100] bg-background pt-2">
                <DialogTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="ml-2 text-sm text-muted-foreground">
                      {relativeLocationString} at {elevationString}
                    </div>
                  </div>
                </DialogTitle>
                <TabsList className="w-full shadow-md">
                  <TabsTrigger value="graphs" className="w-full text-xs">
                    Graphs
                  </TabsTrigger>
                  <TabsTrigger value="details" className="w-full text-xs">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="discussion" className="w-full text-xs">
                    Discussion
                  </TabsTrigger>
                  <TabsTrigger value="snotel" className="w-full text-xs">
                    Snotel
                  </TabsTrigger>
                </TabsList>
              </DialogHeader>
              <TabsContent value="graphs" className="h-full">
                <ForecastGraphs dailyForecast={forecast} />
              </TabsContent>
              <TabsContent value="details" className="">
                <div className="min-h-full space-y-4">
                  {forecast.data?.data.map((period) => (
                    <div key={period.number}>
                      <div>{period.name}</div>
                      <div className="text-xs">
                        {units === "metric"
                          ? period.detailedForecast
                          : convertMetricForecastToImperial(
                              period.detailedForecast
                            )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="discussion">
                <DiscussionSection office={meta.data?.properties.gridId} />
              </TabsContent>
              <TabsContent value="snotel">
                <SnotelSection hash={hash} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
