import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {

    const data = await db.snoTel.findMany({
        select: {
            name: true,
            elevation: true,
            state: true,
            county: true,
            id: true
        }
    });

    return NextResponse.json(data);
}