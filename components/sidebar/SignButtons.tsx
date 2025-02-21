"use client";

import { LogIn, LogOut } from "lucide-react";

import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { signIn, signOut } from "@hono/auth-js/react";

export function SignInItem() {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signIn()}>
                <LogIn />
                ログイン
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function SignOutItem() {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()}>
                <LogOut />
                ログアウト
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
