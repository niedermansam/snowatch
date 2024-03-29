import {
  SnotelGraphSection,
} from "~/modules/snotel/components/SnotelGraph";
import { Snotel } from "~/modules/snotel/data";


export default async function SnotelPage({
  params,
}: {
  params: { id: string };
}) {
  const snotel = new Snotel(params.id.replaceAll(/%3a/gi, ":"));

  await snotel.getCalendarYearDailyData();

  const snowData = snotel.getDailySnowGraphData();
  // const temperatureData = snotel.getDailyTemperatureData();


  const hasSnow = !!snowData.snowDepth.length && Math.max(...snowData.snowDepth) > 0;

  const defaultEndDate = new Date(new Date().setMonth(new Date().getMonth() - 1));

  const dateRange = [new Date(), defaultEndDate];

 

  return (
    <div>
      <h1>Snotel</h1>
      <p>{snotel.id}</p>
      <SnotelGraphSection snotel={snotel} />
    </div>
  );
}
