import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/transactions", "/categorias", "/metas", "/relatorios"];

export function proxy(request: NextRequest) {
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  const session = request.cookies.get("financehub_session");

  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/categorias/:path*", "/metas/:path*", "/relatorios/:path*"],
};
