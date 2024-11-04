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
  console.log(families);
  return NextResponse.json(families);
}
