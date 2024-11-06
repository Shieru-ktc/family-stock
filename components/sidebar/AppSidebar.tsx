import {
  Sidebar,
  SidebarHeader,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { auth } from "@/auth";
import { Cog, LogOut, User } from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarGroupLabel,
} from "../ui/sidebar";
import Link from "next/link";
import FamilyItems from "./FamilyItems";

export default async function AppSidebar() {
  const session = await auth();
  let sidebar;
  if (session?.user) {
    sidebar = (
      <>
        <SidebarGroup>
          <SidebarGroupLabel>アカウント</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/profile"}>
                    <User />
                    プロフィール
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/settings"}>
                    <Cog />
                    設定
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/settings"}>
                    <LogOut />
                    ログアウト
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </>
    );
  }

  return (
    <Sidebar>
      <SidebarContent>
        {sidebar}
        <FamilyItems />
      </SidebarContent>
    </Sidebar>
  );
}
