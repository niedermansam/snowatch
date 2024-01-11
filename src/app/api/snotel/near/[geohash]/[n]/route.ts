import { type NextRequest, NextResponse } from "next/server";
import { nearestSnotelAPI } from "../../../../../../modules/snotel/server/nearestSnotelApi";

export async function GET(
  req: NextRequest,
  context: {
    params: {
      geohash: string;
      n: string;
    };
  }
) {
  const geohash = context.params.geohash;

  const n = parseInt(context.params.n || "5");

  const minElevation = parseInt(
    req.nextUrl.searchParams.get("minElevation") || "0"
  );

  const data = await nearestSnotelAPI(geohash, n, minElevation);

  return NextResponse.json(data);
}
