import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const url = new URL("/snotel/near/c2qft", request.url)
  console.log(url)
  return NextResponse.rewrite(url);
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/snotel/",
};
