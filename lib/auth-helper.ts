"use server";

import { Family, Member } from "@prisma/client";

import { prisma } from "./prisma";

export default async function getMember(
    userId: string,
    familyId: string,
): Promise<{ family: Family; member: Member; isAdmin: boolean } | null> {
    const member = await prisma.member.findFirst({
        where: {
            userId: userId,
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
        isAdmin: member.role === "ADMIN" || member.Family.ownerId === userId,
    };
}
