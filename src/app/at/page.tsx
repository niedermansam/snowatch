import SnowForecastGraph from "~/modules/forecast/components/ForecastSnowGraph";
import Forecast,{  type  FullForecastInstance } from "~/modules/forecast";

function ForecastDetailsItem({
  forecast,
}: {
  forecast: FullForecastInstance["data"][number];
}) {
  return (
    <div className="flex flex-col">
      <h2>{forecast.name}</h2>
      <p>{forecast.detailedForecast}</p>
      <p>
        {forecast.snow.text} high: {forecast.snow.high} low: {forecast.snow.low}
      </p>
    </div>
  );
}

export default async function LocationPage() {
  const noaa = new Forecast(48.59, -113.666);

  await noaa.getForecast();

  const dates = noaa.forecast?.getNames();
  const lowDaily = noaa.forecast?.getLowSnow();
  const highDaily = noaa.forecast?.getHighSnow(true);
  const lowCumulative = noaa.forecast?.getCumulativeSnowArray("low");
  const highCumulative = noaa.forecast?.getCumulativeSnowArray("high");

  return (
    <div>
      <h1 className="text-xl ">Hello, Next.js!</h1>

      <div className="flex flex-col">
        <p>
          Cummulative: {noaa.forecast?.cumulativeSnow.low} to{" "}
          {noaa.forecast?.cumulativeSnow.high}
        </p>
        <SnowForecastGraph
          dates={dates}
          lowDaily={lowDaily}
          highDaily={highDaily}
          lowCumulative={lowCumulative}
          highCumulative={highCumulative}
        />
        {noaa.forecast?.data.map((forecast) => (
          <ForecastDetailsItem key={forecast.name} forecast={forecast} />
        ))}
      </div>
    </div>
  );
}
