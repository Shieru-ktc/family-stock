"use client";

import { FormEvent, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { InferResponseType } from "hono/client";
import { useRouter } from "next/navigation";

type ResponseType200 = InferResponseType<
    (typeof apiClient.api.invite)[":inviteId"]["$get"],
    200
>;

type ResponseType404 = InferResponseType<
    (typeof apiClient.api.invite)[":inviteId"]["$get"],
    404
>;

type ResponseType =
    | { success: true; result: ResponseType200 }
    | { success: false; result: ResponseType404 };

export default function FamilyJoinPage() {
    const [response, setResponse] = useState<ResponseType | null>(null);
    const router = useRouter();

    const handleValidate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const link = formData.get("link")?.toString() || "";

        const res = await apiClient.api.invite[":inviteId"].$get({
            param: {
                inviteId: link,
            },
        });

        if (res.ok) {
            const data = await res.json();
            setResponse({ success: true, result: data });
        } else {
            const data = await res.json();
            setResponse({ success: false, result: data });
        }
    };

    const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (response?.success) {
            await apiClient.api.invite[":inviteId"].$post({
                param: {
                    inviteId: response.result.id,
                },
            });
            router.push(`/app/family/${response.result.familyId}`);
        }
    };

    return (
        <div>
            <h1 className="text-2xl">ファミリーに参加する</h1>
            <p>
                参加するには、ファミリーの管理者が提供する招待リンクか、招待コードが必要です。
            </p>
            <form onSubmit={handleValidate}>
                <label>
                    招待リンク:
                    <Input type="text" name="link" />
                </label>
                <Button type="submit">招待リンクを確認</Button>
            </form>
            {response &&
                (response.success ? (
                    <Alert>
                        <AlertTitle>
                            ファミリー {response.result.Family.name}{" "}
                            に招待されています。
                        </AlertTitle>
                        <AlertDescription className="my-4">
                            <p>
                                ファミリーに参加するには、以下のボタンをクリックしてください。
                            </p>
                            <p className="my-2 rounded bg-yellow-100 p-3 dark:bg-yellow-900">
                                ファミリーに参加すると、あなたのアカウント名とメールアドレスがメンバーに共有されます。
                                <br />
                                不正行為については
                                <Link
                                    href="/contact"
                                    className="text-blue-800 underline dark:text-blue-200"
                                >
                                    お問い合わせ
                                </Link>
                                ください。
                            </p>
                            <form onSubmit={handleJoin}>
                                <Button>参加する</Button>
                            </form>
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert variant="destructive">
                        {response.result.message}
                    </Alert>
                ))}
        </div>
    );
}
