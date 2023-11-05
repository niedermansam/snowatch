
'use client'
import React from 'react'
import "leaflet/dist/leaflet.css";
import FullPageMap from '~/modules/map/FullPageMap';
import Geohash from 'latlon-geohash';
import Forecast from '~/modules/forecast';
import dynamic from 'next/dynamic';

const ForecastMap = dynamic(() => import('~/modules/map/ForecastMap'), { ssr: false })


function MapPage() {

  return (
    <ForecastMap />
  );
}

export default MapPage 