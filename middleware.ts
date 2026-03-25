import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const session = req.auth;
  const pathname = req.nextUrl.pathname;

  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

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
});

export const config = {
  matcher: ["/admin/:path*", "/parent/:path*", "/teacher/:path*"],
};
