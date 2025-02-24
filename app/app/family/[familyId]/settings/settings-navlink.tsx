"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export default function SettingsNavLink() {
  const pathname = usePathname()?.split("/").pop() ?? "";

  function LinkTab({ href, children }: { href: string; children: ReactNode }) {
    return (
      <Link
        href={href}
        className={cn(
          "rounded bg-slate-300 p-2 px-4 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-900",
          pathname === href ? "bg-slate-100 dark:bg-slate-900" : "",
        )}
      >
        {children}
      </Link>
    );
  }
  return (
    <div className="m-1 flex space-x-8 rounded-sm bg-slate-200 p-3 py-2 dark:bg-slate-800 overflow-x-auto whitespace-nowrap min-w-full">
      <LinkTab href="general">一般</LinkTab>
      <LinkTab href="invites">招待リンク</LinkTab>
      <LinkTab href="members">メンバー</LinkTab>
    </div>
  );
}
