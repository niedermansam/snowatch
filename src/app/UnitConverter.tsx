export class UnitConverter {
  static cmToInches(cm: number): number {
    return cm / 2.54;
  }

  static inchesToCm(inches: number): number {
    return inches * 2.54;
  }

  static metersToFeet(meters: number): number {
    return meters * 3.28084;
  }

  static metersToMiles(meters: number): number {
    return meters / 1609.34;
  }

  static translateBearing(bearing?: number): string {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    const index = Math.round((bearing ?? 0) / 22.5) % 16;

    return directions[index] ?? "N";
  }

  inchesToCentimeters(inches: number): number {
    return inches * 2.54;
  }

  static celsiusToFareinheit(celsius: number): number {
    return (celsius * 9) / 5 + 32;
  }

 static kphToMph(kmph: number): number {
    return kmph / 1.60934;
  }
}