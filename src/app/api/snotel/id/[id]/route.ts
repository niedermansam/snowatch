import { NextResponse } from "next/server";
import { getSnotelData } from "~/modules/snotel/server/getSnotelData";

export const revalidate = 60 * 60; // 1 hour

export async function GET(
  _req: Request,
  context: {
    params: {
      id: string;
    };
  }
) {
  const snotelData = await getSnotelData(context.params.id);

  return NextResponse.json(snotelData);
}
