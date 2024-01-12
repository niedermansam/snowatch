import { create } from "zustand";

type forecastDispatch = {
    type: 'ADD',
    payload: string
} | {
    type: 'REMOVE',
    payload: string
} | {
    type: 'SET',
    payload: string[]
} | {
    type: 'RESET'
}

const forecastReducer = (state: string[], action: forecastDispatch) => {
    switch (action.type) {
        case 'ADD':
            console.log('add', action.payload)
            return [...state, action.payload]
        case 'REMOVE':
            console.log('remove', action.payload)
            return state.filter(f => f !== action.payload)
        case 'SET':
            console.log('set', action.payload)
            return action.payload
        case 'RESET':
            console.log('reset')
            return []
        default:
            return state
    }
}


type MapStore = {
  forecasts: string[];
  forecastDispatch: (action: forecastDispatch) => void;
//   addForecast: (forecast: string[]) => void;
//   resetForecasts: () => void;
//   removeForecast: (forecast: string) => void;
//   setForecasts: (forecasts: string[]) => void;
};

export const useMapStore = create<MapStore>((set) => {
  return {
    forecasts: [],
    forecastDispatch: (action) =>
      set((state) => ({ forecasts: forecastReducer(state.forecasts, action) })),
    // addForecast: (forecast) =>
    //   set((state) => ({ forecasts: [...state.forecasts, ...forecast] })),
    // resetForecasts: () => set({ forecasts: [] }),
    // removeForecast: (forecast) =>
    //   set((state) => ({
    //     forecasts: state.forecasts.filter((f) => f !== forecast),
    //   })),
    // setForecasts: (forecasts) => set({ forecasts }),
  };
});
