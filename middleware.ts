import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyPortalToken, ERP_SESSION_COOKIE } from "@/lib/portal-token";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const cookieValue = req.cookies.get(ERP_SESSION_COOKIE)?.value;
  const token = cookieValue ? await verifyPortalToken(cookieValue).catch(() => null) : null;

  if (!token) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;

  if (pathname.startsWith("/admin") && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (pathname.startsWith("/parent") && role !== "PARENT") {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (pathname.startsWith("/teacher") && role !== "TEACHER") {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/parent/:path*", "/teacher/:path*", "/portal"],
};
