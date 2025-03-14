"use client";

import { ReactNode, useMemo } from "react";

import { familyAtom } from "@/atoms/familyAtom";
import { useAtom, useAtomValue } from "jotai";
import { AlertCircle } from "lucide-react";
import SettingsNavLink from "./settings-navlink";
import { sessionAtom } from "@/atoms/sessionAtom";

export default function SettingsLayout({ children }: { children: ReactNode }) {
    const session = useAtomValue(sessionAtom);
    const [family] = useAtom(familyAtom);

    const hasAdminPermission = useMemo(() => {
        if (family) {
            return (
                family.ownerId === session?.user?.id ||
                family.Members.some(
                    (member) =>
                        member.userId === session?.user?.id &&
                        member.role === "ADMIN",
                )
            );
        }
    }, [family, session]);

    return (
        <>
            {hasAdminPermission === false && (
                <p className="my-3 inline-flex gap-2 rounded border-yellow-200 bg-yellow-100 p-3 dark:border-yellow-800 dark:bg-yellow-900">
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
