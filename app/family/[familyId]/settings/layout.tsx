"use client";

import { ReactNode, useMemo } from "react";

import { familyAtom } from "@/atoms/familyAtom";
import { useAtom } from "jotai";
import { AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import SettingsNavLink from "./settings-navlink";

export default function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session } = useSession();
  const [family] = useAtom(familyAtom);

  const hasAdminPermission = useMemo(() => {
    if (family) {
      return (
        family.ownerId === session?.user?.id ||
        family.Members.some(
          (member) =>
            member.userId === session?.user?.id && member.role === "ADMIN"
        )
      );
    }
  }, [family, session]);

  return (
    <>
      {hasAdminPermission === false && (
        <p className="p-3 rounded border-yellow-200 dark:border-yellow-800 bg-yellow-100 dark:bg-yellow-900 my-3 inline-flex gap-2">
          <span>
            <AlertCircle />
          </span>
          あなたはこのファミリーの管理者ではありません。一部の設定が制限される可能性があります。
        </p>
      )}
      <SettingsNavLink />
      {children}
    </>
  );
}
