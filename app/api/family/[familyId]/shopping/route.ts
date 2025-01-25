import { Family, StockItem } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SocketEvents } from "@/socket/events";
import {
  FailureResponse,
  FullShopping,
  PartialShopping,
  SuccessResponse,
} from "@/types";

export type ShoppingGetResponse =
  | ({
      family: Family;
      shopping: FullShopping | null;
    } & SuccessResponse)
  | FailureResponse;
export type ShoppingPostResponse =
  | ({
      shopping: PartialShopping;
    } & SuccessResponse)
  | FailureResponse;
export type ShoppingPostRequest = {
  items: StockItem[];
};

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ familyId: string }>;
  },
): Promise<NextResponse<ShoppingGetResponse>> {
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
    include: {
      Shopping: {
        include: {
          Items: {
            include: {
              StockItem: {
                include: {
                  Meta: {
                    include: {
                      Tags: true,
                    },
                  },
                },
              },
            },
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
  return NextResponse.json({
    success: true,
    family,
    shopping: family.Shopping
      ? {
          ...family.Shopping,
          Family: family,
        }
      : null,
  });
}

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ familyId: string }>;
  },
): Promise<NextResponse<ShoppingPostResponse>> {
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
            id: session.user.id,
          },
        },
      },
    },
    include: {
      Shopping: true,
    },
  });
  if (!family) {
    return NextResponse.json(
      { success: false, error: "Family not found" },
      { status: 404 },
    );
  }
  console.log(family);
  if (family.Shopping) {
    return NextResponse.json(
      { success: false, error: "Shopping already exists" },
      { status: 400 },
    );
  }
  const { items } = (await req.json()) as ShoppingPostRequest;
  const createdShopping = await prisma.shopping.create({
    data: {
      familyId: family.id,
      userId: session.user.id,
      Items: {
        create: items.map((item) => ({
          StockItem: {
            connect: {
              id: item.id,
            },
          },
        })),
      },
    },
    include: {
      Items: {
        include: {
          StockItem: {
            include: {
              Meta: {
                include: {
                  Tags: true,
                },
              },
            },
          },
        },
      },
    },
  });
  SocketEvents.shoppingCreated(familyId).dispatch(
    {
      shoppingId: createdShopping.id,
    },
    global.io.in(familyId),
  );
  return NextResponse.json({
    success: true,
    shopping: createdShopping,
  });
}

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ familyId: string }>;
  },
): Promise<NextResponse<ShoppingPostResponse>> {
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
            id: session.user.id,
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
  if (!family.shoppingId) {
    return NextResponse.json(
      { success: false, error: "Shopping not found" },
      { status: 404 },
    );
  }
  const { items } = (await req.json()) as ShoppingPostRequest;
  const updatedShopping = await prisma.shopping.update({
    where: {
      id: family.shoppingId,
    },
    data: {
      Items: {
        create: items.map((item) => ({
          StockItem: {
            connect: {
              id: item.id,
            },
          },
        })),
      },
    },
    include: {
      Items: {
        include: {
          StockItem: {
            include: {
              Meta: {
                include: {
                  Tags: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return NextResponse.json({
    success: true,
    shopping: updatedShopping,
  });
}
