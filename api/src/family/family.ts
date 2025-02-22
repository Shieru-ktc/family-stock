import { Hono } from "hono";
import { familyMiddleware } from "./familyMiddleware";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SocketEvents } from "@/socket/events";
import { manager } from "../ws";

export const familyApi = new Hono()
    .get("/:familyId", familyMiddleware({ Owner: true, Members: true }), async (c) => {
        const familyId = c.req.param("familyId");
        const family = c.var.family;
        const { token } = c.var.authUser;

        return c.json({ message: "Hello, family!", familyId, family, token });
    })
    .get("/:familyId/protected", familyMiddleware({}, "OWNER"), async (c) => {
        return c.json({ message: "Hello, owner!" });
    })
    .post(
        "/join",
        zValidator(
            "json",
            z.object({
                inviteId: z.string(),
            }),
        ),
        async (c) => {
            const { token } = c.var.authUser;
            const { inviteId } = c.req.valid("json");

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
                        },
                    },
                    CreatedBy: true,
                },
            });

            if (!invite) {
                return c.json({ message: "Invalid invite link" }, 400);
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

            return c.json(member.Family);
        },
    )
    .post("/:familyId", familyMiddleware({}, "ADMIN"), async (c) => {
        const familyId = c.req.param("familyId");
        return c.json({ message: "Hello, family! (POST)", familyId });
    })
    .get(
        "/:familyId/invites",
        familyMiddleware({ Invites: true }),
        async (c) => {
            const family = c.var.family;
            return c.json(family?.Invites);
        },
    )
    .post("/:familyId/invite", familyMiddleware({ Invites: true }, "ADMIN"), async (c) => {
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
    });
