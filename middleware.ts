import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // トークンを取得
  const token = await getToken({ req: req as any, secret: process.env.SECRET });

  // トークンがない場合はログインページにリダイレクト
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // トークンがある場合はリクエストを続行
  return NextResponse.next();
}

// middlewareを適用するパスを指定
export const config = {
  matcher: ["/family/:path*"],
};
