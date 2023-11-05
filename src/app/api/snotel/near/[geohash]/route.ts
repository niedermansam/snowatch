import { NextRequest, NextResponse } from "next/server";
import { nearestSnotelAPI } from "../../../../../modules/snotel/server/nearestSnotelApi";

export async function GET(
  req: NextRequest,
  context: {
    params: {
      geohash: string;
    };
  }
) {
  const geohash = context.params.geohash;

  const minElevation = parseInt(
    req.nextUrl.searchParams.get("minElevation") || "0"
  );

  const data = await nearestSnotelAPI(geohash, 1, minElevation);

  return NextResponse.json(data);
}
