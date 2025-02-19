"use client";

import { Cog, Plus, Sandwich, User, UserPlus } from "lucide-react";
import Link from "next/link";

import { Sidebar, SidebarMenuItem } from "@/components/ui/sidebar";

import {
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
} from "../ui/sidebar";
import FamilyItems from "./FamilyItems";
import { SignInItem, SignOutItem } from "./SignButtons";
import { useAtomValue } from "jotai";
import { sessionAtom } from "@/atoms/sessionAtom";

export default function AppSidebar() {
    const session = useAtomValue(sessionAtom);

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
                                    <Link href={"/sandbox"}>
                                        <Sandwich />
                                        サンドボックス
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SignOutItem />
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>ファミリー</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={"/family/create"}>
                                        <Plus />
                                        ファミリーを作成
                                    </Link>
                                </SidebarMenuButton>
                                <SidebarMenuButton asChild>
                                    <Link href={"/family/join"}>
                                        <UserPlus />
                                        ファミリーに参加
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </>
        );
    } else {
        sidebar = (
            <>
                <SidebarGroup>
                    <SidebarGroupLabel>アカウント</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SignInItem />
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
                {session?.user && <FamilyItems />}
            </SidebarContent>
        </Sidebar>
    );
}
