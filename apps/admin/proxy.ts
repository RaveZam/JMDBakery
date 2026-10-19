import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

const authPaths = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const { supabase, response } = createClient(request);
  // getUser() asks Supabase Auth, so a deleted account is caught here.
  // getSession() only reads the cookie and would let it through.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Read from app_metadata, not user_metadata: users can edit their own
  // user_metadata, but only the server can change app_metadata.
  if (user?.app_metadata?.role === "agent") {
    await supabase.auth.signOut();
    const redirect = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  const isAuthPath = authPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (user && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (!user && !isAuthPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
