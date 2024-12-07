import { NextRequest, NextResponse } from "next/server";

import { SocketEvents } from "@/socket/events";

export async function GET(req: NextRequest) {
  SocketEvents.testEvent.dispatch({ message: "Hello" }, global.io);
  return new NextResponse("hello");
}
