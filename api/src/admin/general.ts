import { Hono } from "hono";
import { adminMiddleware } from "./adminMiddleware";
import { prisma } from "@/lib/prisma";

export const generalAdmin = new Hono()
    .get("/families", adminMiddleware, async (c) => {
        const families = await prisma.family.findMany();
        return c.json(families);
    })
    .post("/family/:familyId/renumber", adminMiddleware, async (c) => {
        const { familyId } = c.req.param();
        const family = await prisma.family.findUnique({
            where: {
                id: familyId,
            },
        });
        if (!family) {
            return c.json({ error: "Family not found" }, 404);
        }
        const stocks = await prisma.stockItem.findMany({
            where: {
                familyId,
            },
            include: {
                Meta: true,
            },
            orderBy: {
                Meta: {
                    position: "asc",
                },
            },
        });
    });
