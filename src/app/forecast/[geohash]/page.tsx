
'use client'
import Geohash from 'latlon-geohash'
import React from 'react'
import useForecast from '~/common/hooks/useForecast'

function Page({params: {geohash}}: {params: {geohash: string}}) {

    const {lat, lon: lng}  = Geohash.decode(geohash)
    const forecast = useForecast({lat, lng})
  return (
    <div>{lat}, {lng} {
        forecast.snow.total
        }</div>
  )
}

export default Page