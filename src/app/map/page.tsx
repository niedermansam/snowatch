
import React from 'react'
import "leaflet/dist/leaflet.css";
import FullPageMap from '~/modules/map/FullPageMap';
import Geohash from 'latlon-geohash';
import Forecast from '~/modules/forecast';

const validateForecastLocations = (forecastLocations: string | string[] | undefined): string[] => {


  if (Array.isArray(forecastLocations) && forecastLocations.every( (location) => typeof location === "string")) {
    return forecastLocations
  } else if (typeof forecastLocations === "string") {
    return forecastLocations.split(",")
  } else {
    return []
  }
}

function MapPage({searchParams}:{searchParams: {[key: string]: string | string[]}}) {

  const geohash = searchParams.center || Geohash.encode(44, -114, 4)

  const center = Geohash.decode(geohash as string) 
  const zoom =  searchParams.zoom ? parseInt(searchParams.zoom as string) : 4 

  const forecastLocations = validateForecastLocations(searchParams.forecastLocations)

  console.log(forecastLocations)

  const forecasts = forecastLocations.map( async (location) => {
      const {lat, lon} = Geohash.decode(location)
    const newForecast =  new Forecast(lat, lon)
    await newForecast.getForecast()
    return newForecast
  })


  return (
    <FullPageMap center={[center.lat, center.lon]} zoom={zoom} forecastLocations={forecastLocations} forecasts={forecasts} />
  );
}

export default MapPage 