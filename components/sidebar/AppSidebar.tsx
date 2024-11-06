import { Sidebar } from "@/components/ui/sidebar";
import { auth } from "@/auth";
import AppSidebarBody, { SidebarItems } from "./AppSidebarBody";
import { Family } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const LOGGED_OUT_SIDEBAR: SidebarItems[] = [
  {
    id: "account",
    label: "アカウント",
    items: [
      {
        label: "ログイン",
        href: "/api/auth/signin",
      },
      {
        label: "新規登録",
        href: "/api/auth/signup",
      },
      {
        label: "テーマを切り替え",
        icon: "LogOut",
        href: "$Theme",
      },
    ],
  },
];

const SIDEBAR: SidebarItems[] = [
  {
    id: "account",
    label: "アカウント",
    items: [
      {
        label: "プロフィール",
        icon: "User",
        href: "/profile",
      },
      {
        label: "設定",
        icon: "UserCog",
        href: "/settings",
      },
      {
        label: "ログアウト",
        icon: "LogOut",
        href: "$Logout",
      },
      {
        label: "テーマを切り替え",
        icon: "LogOut",
        href: "$Theme",
      },
    ],
  },
  {
    id: "family-management",
    label: "ファミリーの管理",
    items: [
      {
        label: "ファミリーを作成",
        icon: "Plus",
        href: "/family/create",
      },
      {
        label: "ファミリーに参加",
        icon: "UserPlus",
        href: "/family/join",
      },
    ],
  },
];

export default async function AppSidebar() {
  const session = await auth();

  let sidebarItems: SidebarItems[] = [];
  if (session) {
    sidebarItems = SIDEBAR;
    const families = await prisma.family.findMany({
      where: {
        Members: {
          some: {
            User: {
              id: session.user.id,
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    families.forEach((family: Family) => {
      const existingItemIndex = sidebarItems.findIndex(
        (item) => item.id === family.id
      );
      if (existingItemIndex !== -1) {
        // 既存の要素を削除
        sidebarItems.splice(existingItemIndex, 1);
      }
      sidebarItems.push({
        id: family.id,
        label: family.name,
        items: [
          {
            label: "在庫リスト",
            icon: "Box",
            href: `/family/${family.id}/stocks`,
          },
          {
            label: "買い物",
            icon: "ShoppingCart",
            href: `/family/${family.id}/shopping`,
          },
          {
            label: "家族の設定",
            icon: "Cog",
            href: `/family/${family.id}/settings`,
          },
        ],
      });
    });
  } else {
    sidebarItems = LOGGED_OUT_SIDEBAR;
  }

  return (
    <Sidebar>
      <AppSidebarBody sidebarItems={sidebarItems} />
    </Sidebar>
  );
}
