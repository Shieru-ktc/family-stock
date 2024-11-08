"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Family, Invite, Member } from "@prisma/client";

interface StatusSuccess {
  success: true;
  invite: Invite & { Family: Family & { Members: Member[] } };
}

interface StatusFailure {
  success: false;
  message: string;
}

export type ValidateStatus = StatusSuccess | StatusFailure;

export async function checkInvite(link: string): Promise<ValidateStatus> {
  const session = await auth();

  if (!session || !session.user) {
    return { success: false, message: "ログインしてください。" };
  }
  const invite = await prisma.invite.findFirst({
    where: {
      id: link,
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
    return { success: false, message: "招待リンクが無効です。" };
  }

  if (
    invite.Family.Members.some((member) => member.userId === session.user.id)
  ) {
    return {
      success: false,
      message: `ファミリー ${invite.Family.name} にはすでに参加しています。`,
    };
  }

  return { success: true, invite: invite };
}

export async function joinInvite(link: string): Promise<ValidateStatus> {
  const session = await auth();
  if (!session || !session.user) {
    return { success: false, message: "ログインしてください。" };
  }
  const checkResult = await checkInvite(link);

  if (checkResult.success === false) {
    return checkResult;
  }

  await prisma.member.create({
    data: {
      familyId: checkResult.invite.Family.id,
      userId: session.user.id,
    },
  });

  return checkResult;
}
