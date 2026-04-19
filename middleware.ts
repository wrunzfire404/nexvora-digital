import { auth } from "@/lib/auth-edge";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const pathname = req.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const session = req.auth;

  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};

