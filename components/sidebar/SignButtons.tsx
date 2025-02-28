"use client";

import { CircleHelp, LogIn, LogOut } from "lucide-react";

import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { signIn, signOut } from "@hono/auth-js/react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";

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
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger>
                        <SidebarMenuButton aria-disabled="true">
                            <LogOut />
                            ログアウト
                        </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>展示期間中はご利用いただけません。</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </SidebarMenuItem>
    );
}
