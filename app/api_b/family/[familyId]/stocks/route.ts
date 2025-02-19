import { Family } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { SocketEvents } from "@/socket/events";
import {
    FailureResponse,
    StockItemWithPartialMeta,
    SuccessResponse,
} from "@/types";

export type StocksGetResponse =
    | ({
          family: Family;
          items: StockItemWithPartialMeta[];
      } & SuccessResponse)
    | FailureResponse;
export type StocksPostResponse =
    | ({
          item: StockItemWithPartialMeta;
      } & SuccessResponse)
    | FailureResponse;
export type StocksPostRequest = {
    item: {
        name: string;
        description: string;
        unit: string;
        price: number;
        step: number;
        threshold: number;
        quantity: number;
    };
};

export async function GET(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{ familyId: string }>;
    },
): Promise<NextResponse<StocksGetResponse>> {
    const session = await auth();
    const { familyId } = await params;
    const family = await prisma.family.findFirst({
        where: {
            id: familyId,
            Members: {
                some: {
                    User: {
                        id: session?.user.id,
                    },
                },
            },
        },
    });
    if (!family) {
        return NextResponse.json(
            { success: false, error: "Family not found" },
            { status: 404 },
        );
    }
    const items = await prisma.stockItem.findMany({
        where: {
            familyId: family.id ?? "",
        },
        include: {
            Meta: {
                include: {
                    Tags: true,
                },
            },
        },
        orderBy: {
            id: "asc",
        },
    });
    return NextResponse.json({
        success: true,
        family,
        items,
    });
}

export async function POST(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{ familyId: string }>;
    },
): Promise<NextResponse<StocksPostResponse>> {
    const session = await auth();
    const { familyId } = await params;
    if (!session || !session.user) {
        return NextResponse.json(
            { success: false, error: "" },
            { status: 401 },
        );
    }
    const family = await prisma.family.findFirst({
        where: {
            id: familyId,
            Members: {
                some: {
                    User: {
                        id: session?.user?.id,
                    },
                },
            },
        },
    });
    if (!family) {
        return NextResponse.json(
            { success: false, error: "Family not found" },
            { status: 404 },
        );
    }
    const { item } = (await req.json()) as StocksPostRequest;
    const createdItem = await prisma.stockItem.create({
        data: {
            quantity: item.quantity,
            Family: {
                connect: {
                    id: family.id,
                },
            },
            Meta: {
                create: {
                    name: item.name,
                    description: item.description,
                    unit: item.unit,
                    price: item.price,
                    step: item.step,
                    threshold: item.threshold,
                    Family: {
                        connect: {
                            id: family.id,
                        },
                    },
                },
            },
        },
        include: {
            Meta: {
                include: {
                    Tags: true,
                },
            },
        },
    });
    SocketEvents.stockCreated(familyId).dispatch(
        {
            stock: {
                ...createdItem,
                Meta: { Family: family, ...createdItem.Meta },
            },
        },
        global.io.in(familyId),
    );
    return NextResponse.json({
        success: true,
        item: createdItem,
    });
}

export async function PATCH(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{ familyId: string }>;
    },
): Promise<NextResponse<StocksPostResponse>> {
    const session = await auth();
    const { familyId } = await params;
    if (!session || !session.user) {
        return NextResponse.json(
            { success: false, error: "" },
            { status: 401 },
        );
    }
    const family = await prisma.family.findFirst({
        where: {
            id: familyId,
            Members: {
                some: {
                    User: {
                        id: session?.user?.id,
                    },
                },
            },
        },
    });
    if (!family) {
        return NextResponse.json(
            { success: false, error: "Family not found" },
            { status: 404 },
        );
    }
    const { item } = (await req.json()) as {
        item: { id: string };
    } & StocksPostRequest;
    const updatedItem = await prisma.stockItem.update({
        data: {
            quantity: item.quantity,
            Family: {
                connect: {
                    id: family.id,
                },
            },
            Meta: {
                create: {
                    name: item.name,
                    description: "",
                    unit: "",
                    price: 0.0,
                    step: 1,
                    threshold: 1,
                    Family: {
                        connect: {
                            id: family.id,
                        },
                    },
                },
            },
        },
        include: {
            Meta: {
                include: {
                    Tags: true,
                },
            },
        },
        where: {
            id: item.id,
        },
    });
    SocketEvents.stockUpdated(familyId).dispatch(
        {
            stock: {
                ...updatedItem,
                Meta: { Family: family, ...updatedItem.Meta },
            },
        },
        global.io.in(familyId),
    );
    return NextResponse.json({
        success: true,
        item: updatedItem,
    });
}
