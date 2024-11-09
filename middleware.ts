import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req: req as any, secret: process.env.SECRET });
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  return NextResponse.next();
}

// middlewareを適用するパスを指定
export const config = {
  matcher: ["/family/:path*"],
};
