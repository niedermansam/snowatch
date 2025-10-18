import { useMapEvents } from "react-leaflet";
import { useMapState } from "./useMapState";
import Geohash from "latlon-geohash";

export const EventHandler = ({
  forecasts,
  setForecast,
}: {
  forecasts: string[] | null;
  setForecast: (forecasts: string[]) =>  Promise<URLSearchParams>;
}) => {
  const { setZoom, setCenter } = useMapState();
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      const hash = Geohash.encode(lat, lng, 12);
      if (!forecasts){ 
        setForecast([hash]).catch(console.error);
      return null;
      }
      const newForecasts = [...forecasts, hash];
      setForecast(newForecasts).catch(console.error);
      return  null;
    },
    moveend: () => {
      const { lat, lng } = map.getCenter();
      setCenter(Geohash.encode(lat, lng, 12)).catch(console.error);
      setZoom(map.getZoom()).catch(console.error);
    },

    zoomend: () => {
      setZoom(map.getZoom()).catch(console.error);
      const { lat, lng } = map.getCenter();
      setCenter(Geohash.encode(lat, lng, 12)).catch(console.error);
    },
  });
  return null;
};