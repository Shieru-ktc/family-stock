import { SocketEvents } from "@/socket/events";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  SocketEvents.testEvent.dispatch({ message: "Hello" }, global.io);
  return new NextResponse("hello");
}
