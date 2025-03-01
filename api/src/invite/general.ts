import { prisma } from "@/lib/prisma";
import { SocketEvents } from "@/socket/events";
import { Hono } from "hono";
import { manager } from "../ws";
import { applyOverrides, defaultConfig } from "../family/config";

async function getInvite(inviteId: string) {
    const invite = await prisma.invite.findFirst({
        where: {
            id: inviteId,
            active: true,
            expiresAt: {
                gte: new Date(),
            },
        },
        include: {
            Family: {
                include: {
                    Members: true,
                    FamilyOverrides: true,
                },
            },
            CreatedBy: true,
        },
    });

    if (!invite) {
        return null;
    }
    return {
        ...invite,
        Family: {
            ...invite.Family,
            Members: invite.Family.Members.map((m) => ({
                ...m,
            })),
            Config: {
                ...applyOverrides(
                    defaultConfig(),
                    invite.Family.FamilyOverrides,
                ),
            },
        },
    };
}

export const inviteApi = new Hono()
    .get("/:inviteId", async (c) => {
        const inviteId = c.req.param("inviteId");
        const invite = await getInvite(inviteId);

        if (!invite) {
            return c.json({ message: "Invalid invite link" }, 404);
        }

        return c.json(
            {
                id: invite.id,
                familyId: invite.familyId,
                createdBy: invite.CreatedBy,
                expiresAt: invite.expiresAt,
                active: invite.active,
                Family: {
                    MemberCount: invite.Family.Members.length,
                    ownerId: invite.Family.ownerId,
                    name: invite.Family.name,
                    createdAt: invite.Family.createdAt,
                },
            },
            200,
        );
    })
    .post("/:inviteId", async (c) => {
        const inviteId = c.req.param("inviteId");
        const { token } = c.var.authUser;
        const invite = await getInvite(inviteId);

        if (!invite) {
            return c.json({ message: "Invalid invite link" }, 400);
        }

        if (invite.Family.Members.some((m) => m.userId === token?.sub)) {
            return c.json(
                { message: "You are already a member of this family" },
                400,
            );
        }

        if (
            invite.Family.Members.length >=
            invite.Family.Config.maxMembersPerFamily
        ) {
            return c.json(
                {
                    message:
                        "This family has reached the maximum number of members",
                },
                400,
            );
        }

        const member = await prisma.member.create({
            data: {
                familyId: invite.familyId,
                userId: token?.sub!,
            },
            select: {
                Family: true,
            },
        });

        SocketEvents.familyCreated.dispatch(
            {
                family: member.Family,
            },
            manager.in(token?.sub),
        );

        return c.json(member);
    });
