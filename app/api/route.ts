import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log(req.cookies);
  return new NextResponse("hello");
}
