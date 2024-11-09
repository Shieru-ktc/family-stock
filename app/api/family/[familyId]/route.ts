import { auth } from "@/auth";
import { CustomResponse } from "@/errors";
import getMember from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
  await prisma.family.delete({
    where: {
      id: familyId,
    },
  });

  return NextResponse.json({ success: true });
}
