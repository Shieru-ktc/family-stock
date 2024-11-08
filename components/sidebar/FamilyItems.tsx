"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from "../ui/sidebar";
import { Family } from "@prisma/client";
import { Box, ChevronDown, Cog, ShoppingCart } from "lucide-react";
import Link from "next/link";
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
    socket.on("newFamily", (family: Family) => {
      console.log(family);
      setFamilies((prevFamilies) => {
        if (prevFamilies === undefined) {
          return [family];
        } else {
          return [...prevFamilies, family];
        }
      });
    });

    return () => {
      socket.off("newFamily");
    };
  }, [socket]);

  if (families === undefined) {
    return (
      <div className="px-2">
        <Skeleton className="w-full h-4 my-2" />
        <div className="py-1">
          <Skeleton className="w-full h-7 my-3" />
          <Skeleton className="w-full h-7 my-3" />
          <Skeleton className="w-full h-7 my-3" />
          <Skeleton className="w-full h-7 my-3" />
        </div>
      </div>
    );
  } else {
    return (
      <>
        {families.map((family: Family) => (
          <Collapsible className="group/collapsible" key={family.id}>
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  {family.name}
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
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
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </>
    );
  }
}
