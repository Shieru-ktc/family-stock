"use client";

import { Family } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
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

export default function FamilyItems() {
  const [socket] = useAtom(socketAtom);
  const { data } = useQuery<Family[]>({
    queryFn: async () => {
      const response = await fetch("/api/family");
      return response.json();
    },
    queryKey: ["families"],
  });

  const [families, setFamilies] = useState<Family[] | undefined>(undefined);

  useEffect(() => {
    if (data) {
      setFamilies(data);
    }
  }, [data]);

  useEffect(() => {
    const unsubscribeCreated = SocketEvents.familyCreated.listen(
      socket,
      ({ family }) => {
        setFamilies((prevFamilies) => {
          if (prevFamilies === undefined) {
            return [family];
          } else {
            return [...prevFamilies, family];
          }
        });
      },
    );
    const unsubscribeDeleted = SocketEvents.familyDeleted.listen(
      socket,
      ({ family }) => {
        setFamilies((prevFamilies) => {
          if (prevFamilies === undefined) {
            return undefined;
          } else {
            return prevFamilies.filter((f) => f.id !== family.id);
          }
        });
      },
    );

    return () => {
      unsubscribeCreated();
      unsubscribeDeleted();
    };
  }, [socket]);

  if (families === undefined) {
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
  } else {
    return (
      <>
        {families.map((family: Family) => (
          <SidebarGroup key={family.id}>
            <SidebarGroupLabel>
              {family.name}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuButton asChild>
                  <Link href={`/family/${family.id}/stocks`}>
                    <Box />
                    在庫リスト
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <Link href={`/family/${family.id}/shopping`}>
                    <ShoppingCart />
                    買い物
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <Link href={`/family/${family.id}/settings/general`}>
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
}
