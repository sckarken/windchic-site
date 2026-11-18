import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verify } from "./lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/login") || pathname.startsWith("/_next") || /\.(png|svg|ico|jpg|webp)$/.test(pathname)) return NextResponse.next();
  const s = await verify(req.cookies.get(COOKIE)?.value);
  if (!s) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
