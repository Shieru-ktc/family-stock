import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  global.io.in(session?.user.id).emit("newFamily", family);
  return NextResponse.json(family);
}
