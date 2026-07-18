import { NextRequest, NextResponse } from "next/server";
import { getOptionalSession } from "@/lib/auth";

const PROTECTED_PREFIXES = ["/planner", "/tracker", "/analytics"];
const AUTH_PAGES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getOptionalSession(request.headers);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p);

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/tracker", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/planner/:path*", "/tracker/:path*", "/analytics/:path*", "/login", "/signup"],
};
