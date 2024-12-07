import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { CustomResponse } from "@/errors";
import getMember from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ familyId: string; inviteId: string }> }
) {
  const { familyId, inviteId } = await params;
  const session = await auth();

  if (!session) {
    return CustomResponse.unauthorized();
  }

  console.log(familyId);
  const invite = await prisma.invite.findFirst({
    where: {
      id: inviteId,
      familyId: familyId,
      active: true,
      expiresAt: {
        gte: new Date(),
      },
    },
    include: {
      Family: {
        include: {
          Members: true,
        },
      },
      CreatedBy: true,
    },
  });
  if (!invite) {
    return NextResponse.json(
      { success: false, error: "Invite not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, invite: invite });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ familyId: string; inviteId: string }> }
) {
  const { familyId, inviteId } = await params;
  const session = await auth();

  if (!session) {
    return CustomResponse.unauthorized();
  }

  const member = await getMember(session.user.id, familyId);
  if (!member || !member.isAdmin) {
    return CustomResponse.noPermission();
  }

  const invite = await prisma.invite.findFirst({
    where: {
      id: inviteId,
      familyId: familyId,
      active: true,
      expiresAt: {
        gte: new Date(),
      },
    },
    include: {
      Family: true,
      CreatedBy: true,
    },
  });
  if (!invite) {
    return NextResponse.json(
      { success: false, error: "Invite not found" },
      { status: 404 }
    );
  }

  await prisma.invite.update({
    where: {
      id: inviteId,
    },
    data: {
      active: false,
    },
  });

  return NextResponse.json({ success: true });
}
