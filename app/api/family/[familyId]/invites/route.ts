import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Family, Invite, Member, User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface GetSuccess {
  success: true;
  family: Family & {
    Invites: (Invite & {
      CreatedBy: User;
    })[];
  };
}

interface GetFailure {
  success: false;
  error: string;
}

export type GetResponse = GetSuccess | GetFailure;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ familyId: string }> }
): Promise<NextResponse<GetResponse>> {
  const { familyId } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Not Authorized" },
      { status: 401 }
    );
  }

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
      Invites: {
        include: {
          CreatedBy: true,
        },
        where: {
          active: true,
          expiresAt: {
            gte: new Date(),
          },
        },
      },
      Members: true,
    },
  });

  if (!family) {
    return NextResponse.json(
      { success: false, error: "Family not found" },
      { status: 404 }
    );
  }
  if (
    family.ownerId !== session.user.id &&
    !family.Members.some(
      (m) => m.role === "ADMIN" && m.userId === session.user.id
    )
  ) {
    return NextResponse.json(
      { success: false, error: "No Permission" },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true, family: family });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ familyId: string }> }
) {
  const { familyId } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Not Authorized" }, { status: 401 });
  }

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
