import { auth } from "@/auth";
import { CustomResponse } from "@/errors";
import { prisma } from "@/lib/prisma";
import { SocketEvents } from "@/socket/events";
import { NextResponse } from "next/server";

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

export async function POST() {
  const session = await auth();
  if (!session || !session.user) {
    return CustomResponse.unauthorized();
  }
  const family = await prisma.family.create({
    data: {
      name: "New Family",
      Members: {
        create: {
          User: {
            connect: {
              id: session?.user.id,
            },
          },
        },
      },
      Owner: {
        connect: {
          id: session?.user.id,
        },
      },
    },
  });
  SocketEvents.familyCreated.dispatch(
    { family },
    global.io.to(session.user.id)
  );
  return NextResponse.json(family);
}
