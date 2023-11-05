export const METERS_TO_FEET = 3.28084;
export const FEET_TO_METERS = 1 / METERS_TO_FEET;
export const FEET_TO_MILES = 1 / 5280;
export const METERS_TO_MILES = METERS_TO_FEET * FEET_TO_MILES;

export const feetToMeters = (feet: number) => feet * FEET_TO_METERS;

export const fahrenheitToCelsius = (fahrenheit: number) => (fahrenheit - 32) * 5 / 9;