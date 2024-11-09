"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function SettingsNavLink() {
  const pathname = usePathname().split("/").pop() ?? "";

  function LinkTab({ href, children }: { href: string; children: ReactNode }) {
    return (
      <Link
        href={href}
        className={cn(
          "bg-slate-300 p-2 px-4 rounded hover:bg-slate-100",
          pathname === href ? "bg-slate-100" : ""
        )}
      >
        {children}
      </Link>
    );
  }
  return (
    <div className="py-2 m-1 p-3 flex space-x-8 bg-slate-200 rounded-sm">
      <LinkTab href="general">一般</LinkTab>
      <LinkTab href="invites">招待リンク</LinkTab>
      <LinkTab href="members">メンバー</LinkTab>
    </div>
  );
}