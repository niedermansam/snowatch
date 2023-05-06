import {
  SnotelSnowGraph,
  SnotelTemperatureGraph,
} from "~/components/graphs/Snotel";
import { Snotel } from "~/modules/snotel/data";

export default async function SnotelPage({
  params,
}: {
  params: { id: string };
}) {
  const snotel = new Snotel(params.id.replaceAll(/%3a/gi, ":"));

  await snotel.getWaterYearDailyData();
  await snotel.getHourlyData();

  const snowData = snotel.getDailySnowGraphData();
  const temperatureData = snotel.getDailyTemperatureData();

  return (
    <div>
      <h1>Snotel</h1>
      <p>{snotel.id}</p>
      <SnotelSnowGraph xAxis={snowData.dates} snowDepth={snowData.snowDepths} />
      <SnotelTemperatureGraph {...temperatureData} />
    </div>
  );
}
