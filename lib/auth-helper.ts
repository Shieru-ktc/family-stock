"use server";

import { Session } from "next-auth";
import { prisma } from "./prisma";
import { Family, Member } from "@prisma/client";

export default async function getMember(
  session: Session,
  familyId: string
): Promise<{ family: Family; member: Member; isAdmin: boolean } | null> {
  if (!session) {
    return null;
  }
  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      familyId: familyId,
    },
    include: {
      Family: true,
    },
  });
  if (!member) {
    return null;
  }
  return {
    family: member.Family,
    member: member,
    isAdmin:
      member.role === "ADMIN" || member.Family.ownerId === session.user.id,
  };
}
