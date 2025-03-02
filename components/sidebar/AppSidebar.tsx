"use client";

import { Cog, Newspaper, Plus, Sandwich, User, UserPlus } from "lucide-react";
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
import { socketAtom } from "@/atoms/socketAtom";

export default function AppSidebar() {
    const session = useAtomValue(sessionAtom);
    const socket = useAtomValue(socketAtom);

    let sidebar;
    if (session?.user) {
        sidebar = (
            <>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={"/main/news"}>
                                        <Newspaper />
                                        ニュース
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>アカウント</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={"/main/profile"}>
                                        <User />
                                        プロフィール
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={"/main/settings"}>
                                        <Cog />
                                        設定
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
                                    <Link href={"/main/family/create"}>
                                        <Plus />
                                        ファミリーを作成
                                    </Link>
                                </SidebarMenuButton>
                                <SidebarMenuButton asChild>
                                    <Link href={"/main/family/join"}>
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
