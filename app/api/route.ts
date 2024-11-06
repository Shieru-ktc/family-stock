import { NextResponse } from "next/server";

export async function GET() {
  console.log(global.socket);
  return new NextResponse("hello");
}
