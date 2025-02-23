import { Hono } from "hono";
import { familyMiddleware } from "./familyMiddleware";
import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { stocksApi } from "./stocks";

export const familyApi = new Hono()
    .get(
        "/:familyId",
        familyMiddleware({ Owner: true, Members: { include: { User: true } } }),
        async (c) => {
            const family = c.var.family;
            return c.json(family);
        },
    )
    .get("/:familyId/protected", familyMiddleware({}, "OWNER"), async (c) => {
        return c.json({ message: "Hello, owner!" });
    })
    .delete("/:familyId", familyMiddleware({}, "OWNER"), async (c) => {
        const familyId = c.req.param("familyId");
        await prisma.family.delete({
            where: {
                id: familyId,
            },
        });
        return c.status(204);
    })
    .get(
        "/:familyId/members",
        familyMiddleware({ Members: true }),
        async (c) => {
            const family = c.var.family;
            return c.json(
                family?.Members.map((m) => ({
                    ...m,
                    isOwner: m.userId === family?.ownerId,
                })),
            );
        },
    )
    .patch(
        "/:familyId/member/:userId",
        zValidator("json", z.object({ role: z.enum(["MEMBER", "ADMIN"]) })),
        familyMiddleware({ Members: true }, "OWNER"),
        async (c) => {
            const family = c.var.family;
            const userId = c.req.param("userId");
            const data = c.req.valid("json");
            const member = await prisma.member.update({
                where: {
                    userId_familyId: {
                        userId,
                        familyId: family.id,
                    },
                },
                data: {
                    role: data.role,
                },
            });
            return c.json(member);
        },
    )
    .delete(
        "/:familyId/member/:userId",
        familyMiddleware({}, "OWNER"),
        async (c) => {
            const family = c.var.family;
            const userId = c.req.param("userId");
            await prisma.member.delete({
                where: {
                    userId_familyId: {
                        userId,
                        familyId: family.id,
                    },
                },
            });
            // TODO: WebSocketのルームからも削除する
            return c.status(204);
        },
    )
    .get(
        "/:familyId/invites",
        familyMiddleware({ Invites: true }),
        async (c) => {
            const family = c.var.family;
            return c.json(family?.Invites);
        },
    )
    .post(
        "/:familyId/invite",
        familyMiddleware({ Invites: true }, "ADMIN"),
        async (c) => {
            const { token } = c.var.authUser;
            const familyId = c.req.param("familyId");
            const invite = await prisma.invite.create({
                data: {
                    familyId: familyId,
                    createdById: token?.sub,
                    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                },
            });
            return c.json(invite);
        },
    )
    .delete(
        "/:familyId/invite/:inviteId",
        familyMiddleware({ Invites: true }, "ADMIN"),
        async (c) => {
            const inviteId = c.req.param("inviteId");
            await prisma.invite.delete({
                where: {
                    id: inviteId,
                },
            });
            return c.status(204);
        },
    )
    .route("/:familyId", stocksApi);
