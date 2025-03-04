"use client";

import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { familyAtom } from "@/atoms/familyAtom";
import HttpError from "@/components/HttpError";
import { apiClient } from "@/lib/apiClient";
import { dummyUser } from "@/lib/dummy";
import { useAtomValue } from "jotai";
import InviteActionComponent from "./InviteActionComponent";

export default function InvitesPage({
    params,
}: {
    params: Promise<{ familyId: string }>;
}) {
    const { familyId } = React.use(params);
    const family = useAtomValue(familyAtom);
    const [statusCode, setStatusCode] = useState(200);
    const { data, isPending } = useQuery({
        queryKey: ["family", familyId, "invites"],
        queryFn: async () => {
            return await (
                await apiClient.api.family[":familyId"].invites.$get({
                    param: { familyId },
                })
            ).json();
        },
        select: (data) =>
            data.map((invite) => ({
                ...invite,
                createdAt: new Date(invite.createdAt),
                expiresAt: new Date(invite.expiresAt),
                CreatedBy:
                    invite.CreatedBy ?
                        {
                            ...invite.CreatedBy,
                            createdAt: new Date(invite.CreatedBy.createdAt),
                            emailVerified:
                                invite.CreatedBy.emailVerified ?
                                    new Date(invite.CreatedBy.emailVerified)
                                :   null,
                        }
                    :   null,
            })),
    });
    if (family) {
        return (
            <div>
                <h1 className="text-2xl">発行された招待</h1>
                <p>
                    以下は、このファミリーに対して発行された招待リンクです。作成から一週間が経過した招待は無効になります。
                    <br />
                    管理者は、この画面からいつでも削除できます。
                </p>
                <p className="my-2">
                    お使いのプランでは、最大 {family.Config.maxInvitesPerFamily}{" "}
                    個の招待リンクを発行できます。
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                        （残り{" "}
                        {family.Config.maxInvitesPerFamily - (data?.length ?? 0)} 個）
                    </span>
                </p>

                {isPending ?
                    <div className="my-2">
                        <Skeleton className="h-16 w-full" />
                    </div>
                : data ?
                    <Table>
                        <TableCaption>有効な招待リンクの一覧</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>招待コード</TableHead>
                                <TableHead>作成日時</TableHead>
                                <TableHead>作成者</TableHead>
                                <TableHead>アクション</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((invite) => (
                                <TableRow key={invite.id}>
                                    <TableCell>{invite.id}</TableCell>
                                    <TableCell>
                                        {invite.createdAt.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {(invite.CreatedBy ?? dummyUser()).name}
                                    </TableCell>
                                    <InviteActionComponent
                                        invite={{
                                            ...invite,
                                            CreatedBy:
                                                invite.CreatedBy ?? dummyUser(),
                                        }}
                                    />
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                :   <HttpError code={statusCode} />}
            </div>
        );
    }
}
