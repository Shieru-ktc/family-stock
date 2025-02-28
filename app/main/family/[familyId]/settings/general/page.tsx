"use client";

import { Member, User } from "@prisma/client";

import { familyAtom } from "@/atoms/familyAtom";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { apiClient } from "@/lib/apiClient";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { getRole, getRoleLabel } from "@/lib/utils";
import { Calendar, Notebook, ShieldCheck, UsersIcon } from "lucide-react";

function getRoleDescription(role: "OWNER" | "ADMIN" | "MEMBER") {
    switch (role) {
        case "OWNER":
            return (
                <p>
                    このファミリーの所有者です。
                    <br />
                    すべての権限を所有しています。
                </p>
            );
        case "ADMIN":
            return (
                <p>
                    このファミリーの共同管理者です。
                    <br />
                    ファミリーへの招待リンクを作成・削除する権限や、
                    <br />
                    タグを作成・編集・削除する権限を所有しています。
                </p>
            );
        case "MEMBER":
            return (
                <p>
                    このファミリーのメンバーです。
                    <br />
                    ファミリー内の在庫アイテムを作成・編集・削除する権限を所有しています。
                    <br />
                    このページ内にある設定の、いくつかの項目にはアクセスできないかもしれません。
                </p>
            );
    }
}
export default function FamilySettingsPage() {
    const [family] = useAtom(familyAtom);

    return family ? (
        <div>
            <h1 className="text-2xl">ファミリーの設定</h1>
            <p className="mb-2">
                メンバーの追加や、タグの管理などが行えます。
                <br />
                上部のタブから画面を切り替えてください。
            </p>
            <hr />
            <h2 className="mt-2 text-xl">統計情報</h2>
            <div className="mt-2 grid max-w-[60rem] grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="inline-flex gap-2">
                            <Calendar />
                            ファミリー作成日時
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">
                            {family.createdAt.toLocaleString()}
                        </p>
                        <p className="mt-5 text-xs text-gray-300 dark:text-gray-700">
                            ええ、この情報がなんのために役立つのかは不明ですが。
                            <br />
                            記念日にしたほうがいいかもしれませんね。
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="inline-flex gap-2">
                            <ShieldCheck />
                            あなたの権限
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">
                            {getRoleLabel(
                                family.Members.find(
                                    (member: Member) =>
                                        member.userId == family.ownerId,
                                )!,
                                family.ownerId,
                            )}
                        </p>
                        <div className="text-sm text-gray-500">
                            {getRoleDescription(
                                getRole(
                                    family.Members.find(
                                        (member: Member) =>
                                            member.userId == family.ownerId,
                                    )!,
                                    family.ownerId,
                                ),
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="inline-flex gap-2">
                            <UsersIcon />
                            メンバー数
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                        <p className="text-lg">
                            {family.Members.length}人のメンバー
                        </p>
                        <p className="text-sm text-gray-500">
                            (残り {5 - family.Members.length} スロット)
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button variant={"outline"} asChild>
                            <Link href="./members">詳しく見る</Link>
                        </Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="inline-flex gap-2">
                            <Notebook />
                            デバッグ情報
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl>
                            <dt>ファミリーID</dt>
                            <dd className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                {family.id}
                            </dd>
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </div>
    ) : (
        <p>Family not found.</p>
    );
}
