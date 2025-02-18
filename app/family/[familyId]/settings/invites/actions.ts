"use server";

import { Family, Invite, Member } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DeleteInvite(
    invite: Invite & { Family: Family & { Members: Member[] } },
) {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error("You need to be logged in to delete an invite");
    }
    if (
        invite.Family.Members.some(
            (member) =>
                invite.Family.ownerId !== session.user.id &&
                member.role !== "ADMIN",
        )
    ) {
        throw new Error(
            "You need to be the owner of the family or an admin to delete an invite",
        );
    }

    return await prisma.invite.delete({
        where: { id: invite.id },
    });
}
