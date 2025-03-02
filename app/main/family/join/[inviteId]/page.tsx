"use client";

import Loading from "@/components/Loading";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { useMutation } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { use, useEffect, useState } from "react";

// TODO: 招待リンク(URL)の状態のものを処理するように変更する
export default function JoinWithUrl({
    params,
}: {
    params: Promise<{ inviteId: string }>;
}) {
    const inviteId = use(params).inviteId;
    const [invite, setInvite] = useState<
        | InferResponseType<
              (typeof apiClient.api.invite)[":inviteId"]["$get"],
              200
          >
        | undefined
    >(undefined);
    const joinFamily = useMutation({
        mutationFn: async () => {
            await apiClient.api.invite[":inviteId"].$post({
                param: {
                    inviteId,
                },
            });
        },
    });

    useEffect(() => {
        apiClient.api.invite[":inviteId"]
            .$get({
                param: {
                    inviteId,
                },
            })
            .then(async (res) => {
                if (res.ok) {
                    const invite = await res.json();
                    setInvite(invite);
                }
            });
    }, [inviteId]);

    return invite ? (
        <>
            <h1 className="text-2xl">ファミリーに参加</h1>
            <Alert className="my-4">
                <AlertTitle>
                    ファミリー {invite.Family.name} に招待されています。
                </AlertTitle>
                <AlertDescription className="my-4">
                    <p>
                        ファミリーに参加するには、以下のボタンをクリックしてください。
                    </p>
                    <p className="my-2 rounded bg-yellow-100 p-3 dark:bg-yellow-900">
                        ファミリーに参加すると、あなたのアカウント名とメールアドレスがメンバーに共有されます。
                    </p>
                    <Button onClick={() => joinFamily.mutate()}>
                        参加する
                    </Button>
                </AlertDescription>
            </Alert>
        </>
    ) : (
        <Loading />
    );
}
