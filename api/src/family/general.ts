import { prisma } from "@/lib/prisma";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { SocketEvents } from "@/socket/events";
import { manager } from "../ws";
import { familyApi } from "./family";
import { MAX_FAMILIES_PER_USER } from "@/vars";

export const generalFamily = new Hono()
    .get("/", async (c) => {
        const { token } = c.var.authUser;
        const families = await prisma.family.findMany({
            where: {
                Members: {
                    some: {
                        User: {
                            id: token?.sub,
                        },
                    },
                },
            },
        });
        return c.json(families);
    })
    .post(
        "/",
        zValidator(
            "json",
            z.object({
                name: z.string().min(1).max(20),
            }),
        ),
        async (c) => {
            const { token } = c.var.authUser;
            console.log(token);
            const data = c.req.valid("json");
            const familyCount = await prisma.family.count({
                where: {
                    Members: {
                        some: {
                            User: {
                                id: token?.sub,
                            },
                        },
                    },
                },
                take: MAX_FAMILIES_PER_USER,
            })
            if (familyCount >= MAX_FAMILIES_PER_USER) {
                return c.json({
                    error: "You have reached the maximum number of families.",
                }, 400);
            }
            const family = await prisma.family.create({
                data: {
                    name: data.name,
                    Members: {
                        create: {
                            User: {
                                connect: {
                                    id: token?.sub,
                                },
                            },
                        },
                    },
                    Owner: {
                        connect: {
                            id: token?.sub,
                        },
                    },
                },
            });
            SocketEvents.familyCreated.dispatch(
                { family },
                manager.in(token?.sub),
            );
            return c.json(family);
        },
    )
    .route("/", familyApi);
