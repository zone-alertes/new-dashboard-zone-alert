import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "za_session";
const PUBLIC = ["/connexion", "/verification"];

/**
 * Optimistic route guard (Next 16 "proxy", ex-middleware):
 * anonymous visitors are sent to /connexion before any console page renders.
 * Authorisation itself stays the API's job.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authed = request.cookies.get(SESSION_COOKIE)?.value === "authenticated";
  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));

  if (!authed && !isPublic) {
    const url = new URL("/connexion", request.url);
    if (pathname !== "/") url.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(url);
  }
  if (authed && (pathname === "/" || pathname === "/connexion")) {
    return NextResponse.redirect(new URL("/tableau-de-bord", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|images/|icon.png|favicon.ico|.*\\.(?:png|jpg|svg|webp)$).*)"],
};
