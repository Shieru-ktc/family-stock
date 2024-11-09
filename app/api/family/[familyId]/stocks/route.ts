import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SocketEvents } from "@/socket/events";
import {
  FailureResponse,
  StockItemWithPartialMeta,
  SuccessResponse,
} from "@/types";
import { Family, StockItem } from "@prisma/client";
import { connect } from "http2";
import { NextRequest, NextResponse } from "next/server";

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
  };
};

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ familyId: string }>;
  }
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
      { status: 404 }
    );
  }
  const items = await prisma.stockItem.findMany({
    where: {
      familyId: family?.id ?? "",
    },
    include: {
      Meta: {
        include: {
          Tags: true,
        },
      },
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
  }
): Promise<NextResponse<StocksPostResponse>> {
  const session = await auth();
  const { familyId } = await params;
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: "" }, { status: 401 });
  }
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
      { status: 404 }
    );
  }
  const { item } = (await req.json()) as StocksPostRequest;
  const createdItem = await prisma.stockItem.create({
    data: {
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
  });
  SocketEvents.stockCreated(familyId).dispatch({
    stock: {...createdItem, Meta: {Family: family, ...createdItem.Meta}},
  }, global.io.in(familyId));
  return NextResponse.json({
    success: true,
    item: createdItem,
  });
}
