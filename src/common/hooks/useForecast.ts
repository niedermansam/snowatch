import { useQuery } from '@tanstack/react-query'
import Geohash from 'latlon-geohash'
import React from 'react'
import { z } from 'zod'

const API_URL = 'https://api.weather.gov/points/'

const metadataUrl = (lat: number, lng: number) => `${API_URL}${lat},${lng}`

const validateMetadata = z.object({
    properties: z.object({
        forecast: z.string().url(),
        forecastHourly: z.string().url(),
    }),

})

type NoaaForecast = z.infer<typeof validateForecast>

const parseSnowData = (data: NoaaForecast["properties"]["periods"][number]): {
        low: number;
        high: number;
        text: string;
        period: string;
} => {
  const outputObject = {
    low: 0,
    high: 0,
    text: "",
    period: data.name,
  };

  const snowMatch = data.detailedForecast.match(
    /new snow accumulation of (.*) possible/i
  );

  if (!snowMatch) return outputObject

  let snowText = snowMatch[1];

  if (!snowText) return outputObject

  if (snowText.includes("less than")) {
    snowText = snowText.replace(/.*one quanter of one/, " 0 to 0.25");
    snowText = snowText.replace(/.*one third of one/, " 0 to 0.25");
    snowText = snowText.replace(/.*(a )?half (an )?inch/, "0 to 0.5");
    snowText = snowText.replace(/.*less than one/, "0 to 1");
  }

  if (snowText.includes("around")) {
    snowText = snowText.replace(/.around* (a )?half (an )?inch/, "0.5 to 0.5");
    snowText = snowText.replace(/.*around one/, "1 to 1");
    snowText = snowText.replace(/.*around two/, "2 to 2");
  }

  outputObject.text = snowText;
  const snowAmountMatch = snowText.match(/([\d|\.]+) to ([\d|\.]+)/i);

  if (!snowAmountMatch) return outputObject

  outputObject.low = parseFloat(snowAmountMatch[1] || "0");
  outputObject.high = parseFloat(snowAmountMatch[2] || "0");

  return  outputObject;
};

const parseWindData = (data: NoaaForecast["properties"]["periods"][number]) => {
    const wind = data.windSpeed?.split(' to ').map((s) => parseInt(s.replace(' mph', '')))
    const result = {
        low: wind?.[0] || 0,
        high:  wind?.[1] || 0,
        gusts:  null as number | null,
        text: '',
    }

    const gusts = data.detailedForecast.match(/gust(s?) as high as (.\d+) mph/i)

    if(gusts && gusts[2]) {
        result.gusts = parseInt(gusts[2])
    }

    return result

}

const validateForecast = z.object({
    geometry: z.object({
        coordinates: z.array(z.array(z.array(z.number()))),
    }),
    properties: z.object({
        elevation: z.object({
            value: z.number(),
            unitCode: z.string(),
        }),
        periods: z.array(z.object({
            name: z.string(),
            shortForecast: z.string(),
            detailedForecast: z.string(),
            temperature: z.number(),
            temperatureUnit: z.string(),
            windSpeed: z.string().nullable(),
            windDirection: z.string().nullable(),
            icon: z.string().url(),
            probabilityOfPrecipitation: z.object({value: z.number().nullable()}).transform((val) => val.value),
            relativeHumidity: z.object({value: z.number()}).transform((val) => val.value),
        })),
    }),
})


function useForecast({lat, lng}: {lat: number, lng: number  }) {

    const geohash = Geohash.encode(lat, lng, 6)



    const metadata = useQuery(['forecast metadata', geohash], async () => {
        const res = await fetch( metadataUrl(lat, lng))
        const data = await res.json() as unknown;
        return  validateMetadata.parse(data)
    }
    )

    const forecast = useQuery(['forecast', geohash], async () => {
        if(!metadata.isSuccess) return;
        const res = await fetch(metadata.data.properties.forecast)
        const data = await res.json() as unknown;
        return validateForecast.parse(data)
    }, {enabled: metadata.isSuccess})

    if(metadata.isError) {
        return {
            ...metadata,
            data: null,
        }
    }


    // console.log(forecast.data)

    const snowData = forecast.data?.properties.periods.map(parseSnowData);

    const mostSnow = snowData?.reduce((acc, curr) => {
        if(curr.high > acc.high) return curr
        return acc
    }
    , {low: 0, high: 0, text: '', period: ''})

    const lowSnowfallEstimateTotal = snowData?.reduce((acc, curr) => acc + curr.low, 0) || 0
    const highSnowfallEstimateTotal = snowData?.reduce((acc, curr) => acc + curr.high, 0) || 0

    let totalSnowString = '';



    if(lowSnowfallEstimateTotal > 0 && highSnowfallEstimateTotal === 0) {
        totalSnowString = `At least ${lowSnowfallEstimateTotal} inches`
    }

    if(lowSnowfallEstimateTotal === 0 && highSnowfallEstimateTotal > 0) {
        totalSnowString = `Up to ${highSnowfallEstimateTotal} inches`
    }

    if(lowSnowfallEstimateTotal === highSnowfallEstimateTotal) {
        totalSnowString = `${lowSnowfallEstimateTotal} inches`
    }

    if(lowSnowfallEstimateTotal > 0 && highSnowfallEstimateTotal > 0) {
        totalSnowString = `${lowSnowfallEstimateTotal} to ${highSnowfallEstimateTotal} inches`
    }

    if (lowSnowfallEstimateTotal === 0 && highSnowfallEstimateTotal === 0) {
      totalSnowString = "No snow expected";
    }
    
    totalSnowString = totalSnowString.replace('Up to 1 inches', 'Up to 1 inch')


    
    return {...forecast,
        
        elevation: forecast.data?.properties.elevation.value, 
        snow: {
        total: totalSnowString,
        data: snowData,
        mostSnow,
        getLowSnow: () => snowData?.map((period) => period.low),
        getHighSnow: () => snowData?.map((period) => period.high),
        getTemperature: () => forecast.data?.properties.periods.map((period) => period.temperature),
    }}
}

export default useForecast