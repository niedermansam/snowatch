import { NextResponse } from "next/server";
import { getSnotelCSVData } from "~/modules/snotel/server/getSnotelData";

export const revalidate = 60 * 60; // 1 hour

export async function GET(
  _req: Request,
  context: {
    params: {
      id: string;
    };
  }
) {
  const snotelData = await getSnotelCSVData(context.params.id);

  return NextResponse.json(snotelData);
}
