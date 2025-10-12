"use client";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type DateRangeState = [Date | null, Date | null];

export const SnotelDatePicker = ({dateRange, setDateRange}: {
    dateRange: DateRangeState;
    setDateRange: (dateRange: DateRangeState) => void;
}) => {
  // const [dateRange, setDateRange] = useState<DateRangeState>([null, null]);
  // const [startDate, endDate] = dateRange;
  return (
    <DatePicker
        className="border-2 border-gray-300 rounded-md p-2"
      selectsRange={true}
      startDate={dateRange[0]}
      endDate={dateRange[1]}
      onChange={(update) => {
        setDateRange(update as DateRangeState);
      }}
    />
  );
};
