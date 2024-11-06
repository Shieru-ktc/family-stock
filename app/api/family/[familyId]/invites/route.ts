import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { familyId: string } }
) {
  const familyId = params.familyId;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Not Authorized" }, { status: 401 });
  }

  console.log(familyId);
  const family = await prisma.family.findFirst({
    where: {
      id: familyId,
      Members: {
        some: {
          User: {
            id: session?.user.id,
          },
        },
      },
    },
    include: {
      Invites: true,
      Members: true,
    },
  });

  if (!family) {
    return NextResponse.json({ error: "Family not found" }, { status: 404 });
  }
  console.log(family, session.user);
  if (
    family.ownerId !== session.user.id &&
    !family.Members.some(
      (m) => m.role === "ADMIN" && m.userId === session.user.id
    )
  ) {
    return NextResponse.json({ error: "Not Authorized" }, { status: 403 });
  }

  return NextResponse.json({ invites: family.Invites });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { familyId: string } }
) {
  const familyId = params.familyId;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Not Authorized" }, { status: 401 });
  }

  console.log(familyId);
  const family = await prisma.family.findFirst({
    where: {
      id: familyId,
      Members: {
        some: {
          User: {
            id: session?.user.id,
          },
        },
      },
    },
    include: {
      Invites: true,
      Members: true,
    },
  });

  if (!family) {
    return NextResponse.json({ error: "Family not found" }, { status: 404 });
  }
  console.log(family, session.user);
  if (
    family.ownerId !== session.user.id &&
    !family.Members.some(
      (m) => m.role === "ADMIN" && m.userId === session.user.id
    )
  ) {
    return NextResponse.json({ error: "Not Authorized" }, { status: 403 });
  }

  const invite = await prisma.invite.create({
    data: {
      familyId: familyId,
      createdById: session.user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });
  return NextResponse.json({ ...invite });
}
