"use client";

import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import Link from "next/link";
import dynamic from "next/dynamic";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

export interface SidebarItems {
  id: string;
  label: string;
  items: {
    label: string;
    icon?: keyof typeof iconComponents; // アイコンを文字列として扱う
    href: string;
  }[];
  collapsible?: boolean;
}

const iconComponents = {
  User: dynamic(() => import("lucide-react").then((mod) => mod.User)),
  UserCog: dynamic(() => import("lucide-react").then((mod) => mod.UserCog)),
  LogOut: dynamic(() => import("lucide-react").then((mod) => mod.LogOut)),
  Plus: dynamic(() => import("lucide-react").then((mod) => mod.Plus)),
  UserPlus: dynamic(() => import("lucide-react").then((mod) => mod.UserPlus)),
  Box: dynamic(() => import("lucide-react").then((mod) => mod.Box)),
  ShoppingCart: dynamic(() =>
    import("lucide-react").then((mod) => mod.ShoppingCart)
  ),
  Users: dynamic(() => import("lucide-react").then((mod) => mod.Users)),
  Cog: dynamic(() => import("lucide-react").then((mod) => mod.Cog)),
};

export default function AppSidebarBody({
  sidebarItems,
}: {
  sidebarItems: SidebarItems[];
}) {
  const { setTheme, resolvedTheme } = useTheme();
  const linkBehavior = {
    Logout: () => signOut(),
    Theme: () => {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    },
  };
  return (
    <SidebarContent>
      {sidebarItems.map((group) => {
        const GroupElem = ({ children }: { children: ReactNode }) => (
          <SidebarGroup>{children}</SidebarGroup>
        );
        const GroupContent = (
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const IconComponent = item.icon
                  ? iconComponents[item.icon]
                  : null;
                const linkBehaviorFn = item.href.startsWith("$")
                  ? linkBehavior[
                      item.href.substring(1) as keyof typeof linkBehavior
                    ]
                  : null;
                return (
                  <SidebarMenuItem key={item.label}>
                    {linkBehaviorFn ? (
                      <SidebarMenuButton onClick={linkBehaviorFn}>
                        {IconComponent && <IconComponent />}
                        {item.label}
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton asChild>
                        <Link href={item.href}>
                          {IconComponent && <IconComponent />}
                          {item.label}
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        );
        if (group.collapsible) {
          return (
            <Collapsible className="group/collapsible" key={group.id}>
              <GroupElem>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger>
                    {group.label}
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>{GroupContent}</CollapsibleContent>
              </GroupElem>
            </Collapsible>
          );
        } else {
          return (
            <GroupElem key={group.id}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              {GroupContent}
            </GroupElem>
          );
        }
      })}
    </SidebarContent>
  );
}
