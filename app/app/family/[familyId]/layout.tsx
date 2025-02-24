"use client";

import { ReactNode, use } from "react";

import FamilyPageAtomSetter from "./atomSetter";

export default function FamilyPageLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ familyId: string }>;
}) {
    const familyId = use(params).familyId;

    return (
        <>
            <FamilyPageAtomSetter familyId={familyId}>
                {children}
            </FamilyPageAtomSetter>
        </>
    );
}
