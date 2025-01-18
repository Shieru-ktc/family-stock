import { Family, Invite, User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { CustomResponse } from "@/errors";
import getMember from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

interface GetSuccess {
  success: true;
  family: Family & {
    Invites: (Invite & {
      CreatedBy: User | null;
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
  { params }: { params: Promise<{ familyId: string }> },
): Promise<NextResponse<GetResponse>> {
  const { familyId } = await params;
  const session = await auth();

  if (!session) {
    return CustomResponse.unauthorized();
  }

  const member = await getMember(session.user.id, familyId);

  const family = await prisma.family.findFirst({
    where: {
      id: familyId,
      Members: {
        some: {
          User: {
            id: session.user.id,
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
    },
  });

  if (!family) {
    return NextResponse.json(
      { success: false, error: "Family not found" },
      { status: 404 },
    );
  }
  if (!member || !member.isAdmin) {
    return CustomResponse.noPermission();
  }

  return NextResponse.json({ success: true, family: family });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ familyId: string }> },
) {
  const { familyId } = await params;
  const session = await auth();

  if (!session) {
    return CustomResponse.unauthorized();
  }

  const member = await getMember(session.user.id, familyId);
  const family = await prisma.family.findFirst({
    where: {
      id: familyId,
      Members: {
        some: {
          User: {
            id: session.user.id,
          },
        },
      },
    },
    include: {
      Invites: true,
    },
  });

  if (!family) {
    return NextResponse.json({ error: "Family not found" }, { status: 404 });
  }
  if (!member || !member.isAdmin) {
    return CustomResponse.noPermission();
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
