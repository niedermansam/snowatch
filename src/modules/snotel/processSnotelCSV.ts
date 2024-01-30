import type { SnotelData } from "./types";

function processSnotelDatum(str: string | undefined): number | null {
  if (str === "" || str === undefined) return null;
  return parseFloat(str);
}
export function processSnotelCSV(csv: string) {
  //console.log(csv)
  // remove lines that start with #
  const lines = csv.split("\n").filter((line) => !line.startsWith("#"));
 

  let result: SnotelData[] = [];

  if (!lines[0]) return result;
  const headers = lines[0].split(",");

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    const obj: SnotelData = {
      date: null,
      swe: {
        value: null,
        change: null,
      },
      snow: {
        depth: null,
        change: null,
        density: null,
      },
      temp: {
        avg: null,
        min: null,
        max: null,
        obs: null,
      },
    };

    if (currentLine) {
      const currentLineArray = currentLine.split(",");

      for (let j = 0; j < headers.length; j++) {
        const currentHeader = headers[j];
        const datum = currentLineArray[j];

        if (currentHeader !== undefined) {
          // console.log(currentHeader, datum)
          if (currentHeader.startsWith("Date"))
            obj.date = new Date(datum as string);
          if (currentHeader.startsWith("Snow Water Equivalent")) {
            obj.swe.value = processSnotelDatum(datum);
          }
          if (currentHeader.startsWith("Change In Snow Water Equivalent"))
            obj.swe.change = processSnotelDatum(datum);
          if (currentHeader.startsWith("Snow Depth"))
            obj.snow.depth = processSnotelDatum(datum);
          if (currentHeader.startsWith("Change In Snow Depth"))
            obj.snow.change = processSnotelDatum(datum);
          if (currentHeader.startsWith("Snow Density"))
            obj.snow.density = processSnotelDatum(datum);
          if (currentHeader.startsWith("Air Temperature Average"))
            obj.temp.avg = processSnotelDatum(datum);
          if (currentHeader.startsWith("Air Temperature Minimum"))
            obj.temp.min = processSnotelDatum(datum);
          if (currentHeader.startsWith("Air Temperature Maximum"))
            obj.temp.max = processSnotelDatum(datum);

          if(currentHeader.startsWith("Air Temperature Observed"))
          console.log(currentHeader, datum)
            obj.temp.obs = processSnotelDatum(datum);

          // obj[currentHeader] = datum;
        } else {
          console.log( currentHeader, datum);
        }
      }
      result = [...result, obj];
    }
  }
  return result;
}
