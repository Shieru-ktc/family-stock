"use client";

import { ReactNode, useEffect } from "react";

import { FamilyConfig } from "@/api/src/family/config";
import { familyAtom } from "@/atoms/familyAtom";
import Loading from "@/components/Loading";
import { apiClient } from "@/lib/apiClient";
import { FamilyWithUserMember } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";

export default function FamilyPageAtomSetter({
    children,
    familyId,
}: {
    children: ReactNode;
    familyId: string;
}) {
    const setFamily = useSetAtom(familyAtom);
    const { data: family, isPending } = useQuery({
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
        select: (data) =>
            ({
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
            }) as FamilyWithUserMember & { Config: FamilyConfig },
    });

    useEffect(() => {
        setFamily(family);
    }, [family]);

    return (
        <>
            {isPending ?
                <Loading />
            :   children}
        </>
    );
}
