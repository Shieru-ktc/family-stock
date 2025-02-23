"use client";

import { ReactNode, useEffect } from "react";

import { FamilyWithUserMember } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { apiClient } from "@/lib/apiClient";
import { familyAtom } from "@/atoms/familyAtom";

export default function FamilyPageAtomSetter({
    children,
    familyId,
}: {
    children: ReactNode;
    familyId: string;
}) {
    const setFamily = useSetAtom(familyAtom);
    const { data: family } = useQuery({
        queryKey: ["family", familyId],
        queryFn: async () => {
            return await (
                await apiClient.api.family[":familyId"].$get({
                    param: {
                        familyId,
                    },
                })
            ).json();
        },
        select: (data) => ({
            ...data,
            createdAt: new Date(data.createdAt),
            Members: data.Members.map((member) => ({
                ...member,
                isOwner: member.userId === data.ownerId,
                createdAt: new Date(member.createdAt),
                User: {
                    ...member.User,
                    createdAt: new Date(member.User.createdAt),
                },
            })),
        } as FamilyWithUserMember),
    });

    useEffect(() => {
        setFamily(family);
    }, [family]);
    return <>{children}</>;
}
