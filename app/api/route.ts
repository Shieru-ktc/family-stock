import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new NextResponse("please sign in", { status: 401 });
  } else {
    return new NextResponse("hello");
  }
}
