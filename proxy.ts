import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const isProtectedPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/timetable") ||
    pathname.startsWith("/assignments") ||
    pathname.startsWith("/attendance") ||
    pathname.startsWith("/notices") ||
    pathname.startsWith("/notes") ||
    pathname.startsWith("/profile");

  const isProtectedApi = pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/");

  if (isProtectedPage && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isProtectedApi && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/timetable/:path*",
    "/assignments/:path*",
    "/attendance/:path*",
    "/notices/:path*",
    "/notes/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/api/dashboard/:path*",
    "/api/timetable/:path*",
    "/api/assignments/:path*",
    "/api/attendance/:path*",
    "/api/notices/:path*",
    "/api/notes/:path*",
    "/api/profile/:path*",
    "/api/notifications/:path*",
  ],
};
