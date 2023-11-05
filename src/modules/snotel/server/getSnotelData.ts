import { processSnotelCSV } from "../processSnotelCSV";

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
  return `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/daily/start_of_period/${id}%7Cid=%22%22%7Cname/CurrentCY,CurrentCYEnd/WTEQ::value,WTEQ::median_1991,WTEQ::pctOfMedian_1991,SNWD::value,PREC::value,PREC::median_1991,PREC::pctOfMedian_1991,TMAX::value,TMIN::value,TAVG::value?fitToScreen=false`;
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

export async function getSnotelData(id: string, dataType?: SnotelObservationLength) {
  const url = getDataUrl(id, dataType);
    const response = await fetch(url, {
        next: {
            revalidate: 60 * 30,
        },
    });
    const data = await response.text();
    const json = processSnotelCSV(data);

    return json;
}
