import { Hono } from "hono";
import { familyMiddleware } from "./familyMiddleware";
import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { stocksApi } from "./stocks";
import { shoppingApi } from "./shopping";
import { manager } from "../ws";
import { tagsApi } from "./tags";
import { SocketEvents } from "@/socket/events";
import { recipeApi } from "./recipe";

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
        SocketEvents.familyDeleted.dispatch({ familyId }, manager.in(familyId));
        return c.body(null, 204);
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
            manager.getClientsByUserId(userId).forEach((client) => {
                client.leave(family.id);
            });
            return c.body(null, 204);
        },
    )
    .get(
        "/:familyId/invites",
        familyMiddleware({ Invites: { include: { CreatedBy: true } } }),
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
            const family = c.var.family;
            // 招待リンクが既定数を超えているかどうかを確認
            // findFirstでskipを指定することで、skip番目のデータを取得
            // まだ余裕がある（これが満たされない）場合はnullなので、!== nullで判定する
            const exceededInvite = await prisma.invite.findFirst({
                where: { familyId, active: true },
                skip: family.Config.maxInvitesPerFamily - 1,
            });

            if (exceededInvite) {
                return c.json(
                    {
                        error: "You have reached the maximum number of invites for this family.",
                    },
                    400,
                );
            }
            const invite = await prisma.invite.create({
                data: {
                    familyId: familyId,
                    createdById: token?.sub,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
            return c.body(null, 204);
        },
    )
    .route("/:familyId", stocksApi)
    .route("/:familyId", shoppingApi)
    .route("/:familyId", tagsApi)
    .route("/:familyId", recipeApi);
