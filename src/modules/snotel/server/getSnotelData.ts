import { processSnotelCSV } from "../processSnotelCSV";
import type { SnotelMetadata } from "../types";
function getUrl({
  beginDate,
  endDate,
  duration,
  elements,
  stationTriplets,
}: Partial<{
  beginDate: string;
  endDate: string;
  duration:
    | "DAILY"
    | "HOURLY"
    | "SEMIMONTHLY"
    | "MONTHLY"
    | "WATER_YEAR"
    | "CALENDAR_YEAR";
  elements: (keyof typeof SnotelElementCodes)[];
}> & {
  stationTriplets: string;
}) {
  //https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?beginDate=2024-01-01&centralTendencyType=AVERAGE&duration=DAILY&elements=TAVG&endDate=2024-01-14&periodRef=END&returnFlags=false&returnOriginalValues=false&returnSuspectData=false&stationTriplets=916%3AMT%3ASNTL

  return `https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?beginDate=${beginDate}&centralTendencyType=AVERAGE&duration=${duration}&elements=${elements?.join(
    "%2C"
  )}&endDate=${endDate}&periodRef=END&returnFlags=false&returnOriginalValues=false&returnSuspectData=false&stationTriplets=${stationTriplets}`;
}

const SnotelElementCodes = {
  WTEQ: "Snow Water Equivalent",
  PREC: "Precipitation Accumulation",
  TAVG: "Average Temperature",
  TMIN: "Minimum Temperature",
  TMAX: "Maximum Temperature",
  SNWD: "Snow Depth",
  SNDN: "Snow Density",
  SNOW: "Snowfall",
  SNWDV: "Snow Depth Average",
  SNWDX: "Snow Depth Maximum",
  SNWDN: "Snow Depth Minimum",
};


export function getSnotelData ({

}) {
  const url = getUrl({
    beginDate: "2021-01-01",
    endDate: "2021-01-14",
    duration: "DAILY",
    elements: ["WTEQ", "SNWD", "TAVG", "TMIN", "TMAX", "SNDN"],
    stationTriplets: "916:MT:SNTL",
  });

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    });
}


function get30DayUrl(id: string) {
  return `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/daily/${id}%7Cid=%22%22%7Cname/-30,0/WTEQ::value,WTEQ::delta,SNWD::value,SNWD::delta,TAVG::value,TMIN::value,TMAX::value,SNDN::value`;
}

function getWaterYearDailyUrl(id: string) {
  return `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/daily/${id}%7Cid=%22%22%7Cname/CurrentWY,CurrentWYEnd/WTEQ::value,WTEQ::delta,SNWD::value,SNWD::delta,TAVG::value,TMIN::value,TMAX::value,SNDN::value?fitToScreen=false`;
}

function getHourlyUrl(id: string) {
  return `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/hourly/${id}%7Cid=%22%22%7Cname/-23,0/WTEQ::value,WTEQ::delta,SNWD::value,SNWD::delta,TAVG::value,TMIN::value,TMAX::value,SNDN::value?fitToScreen=false`;
}

function getCalendarYearDailyUrl(id: string) {
  return `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/daily/end_of_period/${id}%7Cid=%22%22%7Cname/CurrentCY,CurrentCYEnd/WTEQ::value,WTEQ::median_1991,WTEQ::pctOfMedian_1991,SNWD::value,PREC::value,PREC::median_1991,PREC::pctOfMedian_1991,TMAX::value,TMIN::value,TAVG::value?fitToScreen=false`;
}



type SnotelObservationLength =
  | "hourly"
  | "daily"
  | "waterYearDaily"
  | "calendarYearDaily";

function getDataUrl(id: string, dataType?: SnotelObservationLength) {
  if (!dataType) return get30DayUrl(id);
  switch (dataType) {
    case "hourly":
      return getHourlyUrl(id);
    case "daily":
      return get30DayUrl(id);
    case "waterYearDaily":
      return getWaterYearDailyUrl(id);
    case "calendarYearDaily":
      return getCalendarYearDailyUrl(id);
    default:
      return get30DayUrl(id);
  }
}

const headers = {
  "Access-Control-Allow-Origin": "*",
};

export async function getSnotelCSVData(
  id: string,
  dataType?: SnotelObservationLength,
  metadata?: SnotelMetadata
) {
  try {
    const url = getDataUrl(id, dataType);
    const response = await fetch(url, {
      next: {
        revalidate: 60 * 30,
      },
    });
    const data = await response.text();
    const json = processSnotelCSV(data);

    return { ...metadata, id, data: json, url };
  } catch (e) {
    console.log(e);
  }
}
