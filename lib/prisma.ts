// lib/prisma.ts
import { StockItemWithMeta, StockItemWithPartialMeta } from "@/types";
import { PrismaClient, StockItem, StockItemMeta } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query"],
    });

export function assertStockItemWithMeta(
    stock: (StockItem & { Meta: StockItemMeta | null }) | null,
) {
    if (!stock || !stock.Meta) {
        throw new Error("StockItem.Meta is null");
    }

    return {
        ...stock,
        Meta: {
            ...stock.Meta,
        },
    };
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
