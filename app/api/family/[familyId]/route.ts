import { Member } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { CustomResponse } from "@/errors";
import getMember from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { SocketEvents } from "@/socket/events";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ familyId: string }> }
): Promise<NextResponse> {
  const session = await auth();
  const familyId = (await params).familyId;

  if (!session || !session.user) {
    return CustomResponse.unauthorized();
  }

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
      Members: {
        include: {
          User: true,
        },
      },
    },
  });
  return NextResponse.json(family);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ familyId: string }> }
): Promise<NextResponse> {
  const { familyId } = await params;
  const session = await auth();
  if (!session) {
    return CustomResponse.unauthorized();
  }
  const member = await getMember(session.user.id, familyId);
  if (!member || !member.isAdmin) {
    return CustomResponse.noPermission();
  }
  const family = await prisma.family.delete({
    where: {
      id: familyId,
    },
    include: {
      Members: true,
    },
  });
  family.Members.forEach(async (member: Member) => {
    SocketEvents.familyDeleted.dispatch(
      { family },
      global.io.to(member.userId)
    );
  });

  return NextResponse.json({ success: true });
}
