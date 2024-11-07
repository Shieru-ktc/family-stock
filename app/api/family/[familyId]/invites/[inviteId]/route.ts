import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ familyId: string; inviteId: string }> }
) {
  const { familyId, inviteId } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Not Authorized" },
      { status: 401 }
    );
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
    return NextResponse.json(
      { success: false, error: "Not Authorized" },
      { status: 401 }
    );
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

  if (
    invite.Family.ownerId !== session.user.id &&
    !invite.Family.Members.some(
      (m) => m.role === "ADMIN" && m.userId === session.user.id
    )
  ) {
    return NextResponse.json(
      { success: false, error: "No Permission" },
      { status: 403 }
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
