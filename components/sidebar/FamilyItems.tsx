"use client";

import { Family } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { Box, Cog, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { socketAtom } from "@/atoms/socketAtom";
import { SocketEvents } from "@/socket/events";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
} from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";
import { apiClient } from "@/lib/apiClient";

export default function FamilyItems() {
    const [socket] = useAtom(socketAtom);
    const { data: families } = useQuery({
        queryFn: async () => {
            return await (await apiClient.api.family.$get()).json();
        },
        select: (data) =>
            data.map((family) => ({
                ...family,
                createdAt: new Date(family.createdAt),
            })),
        queryKey: ["families"],
    });
    const queryClient = useQueryClient();

    useEffect(() => {
        const unsubscribeCreated = SocketEvents.familyCreated.listen(
            socket,
            ({ family }) => {
                queryClient.setQueryData(
                    ["families"],
                    (oldData: Family[] | undefined) => {
                        return oldData ? [...oldData, family] : [family];
                    },
                );
            },
        );
        const unsubscribeDeleted = SocketEvents.familyDeleted.listen(
            socket,
            ({ familyId }) => {
                queryClient.setQueryData(
                    ["families"],
                    (oldData: Family[] | undefined) => {
                        return oldData?.filter((f) => f.id !== familyId);
                    },
                );
            },
        );

        return () => {
            unsubscribeCreated();
            unsubscribeDeleted();
        };
    }, [socket]);

    if (!families) {
        return (
            <div className="px-2">
                <Skeleton className="my-2 h-4 w-full" />
                <div className="py-1">
                    <Skeleton className="my-3 h-7 w-full" />
                    <Skeleton className="my-3 h-7 w-full" />
                    <Skeleton className="my-3 h-7 w-full" />
                    <Skeleton className="my-3 h-7 w-full" />
                </div>
            </div>
        );
    }

    return (
        <>
            {families.map((family: Family) => (
                <SidebarGroup key={family.id}>
                    <SidebarGroupLabel>{family.name}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuButton asChild>
                                <Link href={`/main/family/${family.id}/stocks`}>
                                    <Box />
                                    在庫リスト
                                </Link>
                            </SidebarMenuButton>
                            <SidebarMenuButton asChild>
                                <Link
                                    href={`/main/family/${family.id}/shopping`}
                                >
                                    <ShoppingCart />
                                    買い物
                                </Link>
                            </SidebarMenuButton>
                            <SidebarMenuButton asChild>
                                <Link
                                    href={`/main/family/${family.id}/settings/general`}
                                >
                                    <Cog />
                                    ファミリー設定
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </>
    );
}
