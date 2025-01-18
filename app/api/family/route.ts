import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { CustomResponse } from "@/errors";
import { prisma } from "@/lib/prisma";
import { SocketEvents } from "@/socket/events";

export async function GET() {
  const session = await auth();
  const families = await prisma.family.findMany({
    where: {
      Members: {
        some: {
          User: {
            email: session?.user.email,
          },
        },
      },
    },
  });
  return NextResponse.json(families);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return CustomResponse.unauthorized();
  }
  const data = await req.json();
  const family = await prisma.family.create({
    data: {
      name: data.name,
      Members: {
        create: {
          User: {
            connect: {
              id: session.user.id,
            },
          },
        },
      },
      Owner: {
        connect: {
          id: session.user.id,
        },
      },
    },
  });
  SocketEvents.familyCreated.dispatch(
    { family },
    global.io.to(session.user.id),
  );
  return NextResponse.json(family);
}
