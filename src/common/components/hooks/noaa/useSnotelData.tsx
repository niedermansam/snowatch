import { useQuery } from "@tanstack/react-query";
import { stat } from "fs";

export const SnotelElementCodes = {
  SNWD: "Snow Depth",
  WTEQ: "Water Equivalent",
  PREC: "Precipitation",
  TOBS: "Temperature Observed",
  TMAX: "Temperature Max",
  TMIN: "Temperature Min",
  SNRR: "Snow Rain Ratio",
  STMIN: "Snow Temp Min",
} as const;

const QUERY_ELEMENTS = [
  "SNWD",
  "WTEQ",
  "TOBS",
  "TMIN",
  "TMAX",
  "PREC",
  "SNRR",
  "STMIN",
];

const DURATION = "DAILY";
const PERIOD_REF = "END";
const CENTRAL_TENDENCY_TYPE = "NONE";
const RETURN_FLAGS = "false";
const RETURN_ORIGINAL_VALUES = "false";
const RETURN_SUSPECT_DATA = "false";

const getSnotelUrl = (station: string,
  queryElements = QUERY_ELEMENTS,
  duration = DURATION,
  periodRef = PERIOD_REF,
  centralTendencyType = CENTRAL_TENDENCY_TYPE,
  returnFlags = RETURN_FLAGS,
  returnOriginalValues = RETURN_ORIGINAL_VALUES,
  returnSuspectData = RETURN_SUSPECT_DATA
) => {
  return (
    "https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?stationTriplets=" +
    encodeURIComponent(station) +
    "&elements=" +
    encodeURIComponent(queryElements.join(",")) +
    "&duration=" +
    duration +
    "&periodRef=" +
    periodRef +
    "&centralTendencyType=" +
    centralTendencyType +
    "&returnFlags=" +
    returnFlags +
    "&returnOriginalValues=" +
    returnOriginalValues +
    "&returnSuspectData=" +
    returnSuspectData
  );
};

type SnotelData = {
  stationElement: {
    elementCode: keyof typeof SnotelElementCodes;
    storedUnitCode: string;
    originalUnitCode: string;
  };
  values: {
    date: string;
    value: number;
  }[]
};

type SnotelMeta = {
  stationTriplet: string;
  data: SnotelData[];
};

export const useSnotelData = (station: string) => {
  const url = getSnotelUrl(station);

  const query = useQuery({
    queryKey: ["snotel", station],
    queryFn: async () => {
      try {
        const response = await fetch(url);
        const data= (await response.json())  as SnotelMeta[];
        return data[0]
      } catch   {
        throw new Error(
          `Failed to fetch snotel data from ${station}. Please try again.`,
        );
      }
    },
  });

  return query;
};
