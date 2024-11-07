import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import Link from "next/link";
import { ReactNode } from "react";
import SettingsNavLink from "./settings-navlink";

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SettingsNavLink />
      {children}
    </>
  );
}
