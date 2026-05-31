import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Middleware :
 *  1. Capture le code d'affiliation `?ref=` dans un cookie (30j).
 *  2. Protège les zones authentifiées (redirection vers /login).
 *
 * NB : vérification "légère" du cookie de session (pas d'appel DB en edge).
 * Le contrôle d'autorisation fin est refait côté serveur.
 */
const PROTECTED = ["/dashboard", "/studio", "/chat", "/affiliate", "/admin"];

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const res = NextResponse.next();

  // 1. Affiliation
  const ref = searchParams.get("ref");
  if (ref) {
    const days = Number(process.env.AFFILIATE_COOKIE_DAYS ?? 30);
    res.cookies.set("rma_ref", ref, {
      maxAge: days * 24 * 60 * 60,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  // 2. Protection des routes
  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    const sessionCookie = getSessionCookie(req);
    if (!sessionCookie) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
