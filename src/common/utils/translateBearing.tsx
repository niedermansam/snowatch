export function translateBearing(bearing: number) {
  let positiveBearing: number = bearing;
  if (bearing < 0) {
    positiveBearing = bearing + 360;
  }

  if (positiveBearing > 337.5 || positiveBearing <= 22.5) return "N";
  if (positiveBearing > 22.5 && positiveBearing <= 67.5) return "NE";
  if (positiveBearing > 67.5 && positiveBearing <= 112.5) return "E";
  if (positiveBearing > 112.5 && positiveBearing <= 157.5) return "SE";
  if (positiveBearing > 157.5 && positiveBearing <= 202.5) return "S";
  if (positiveBearing > 202.5 && positiveBearing <= 247.5) return "SW";
  if (positiveBearing > 247.5 && positiveBearing <= 292.5) return "W";
  if (positiveBearing > 292.5 && positiveBearing <= 337.5) return "NW";
  return "N";
}
