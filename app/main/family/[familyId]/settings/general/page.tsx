"use client";

import { Member } from "@prisma/client";

import { familyAtom } from "@/atoms/familyAtom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/apiClient";
import { getRole, getRoleLabel } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import {
    Calendar,
    Loader2,
    Notebook,
    ShieldCheck,
    UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const router = useRouter();

    const deleteFamily = useMutation({
        mutationFn: async () => {
            return await apiClient.api.family[":familyId"].$delete({
                param: {
                    familyId: family!.id,
                },
            });
        },
        onSuccess: () => {
            router.push("/main");
        },
    });

    return family ?
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
                                (残り{" "}
                                {family.Config.maxMembersPerFamily -
                                    family.Members.length}{" "}
                                スロット)
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
                <div className="mt-4 rounded-xl border border-red-800 p-2 dark:border-red-300">
                    <h2 className="my-2 text-2xl text-red-800 dark:text-red-300">
                        Danger Zone
                    </h2>
                    <h3 className="text-xl font-bold">ファミリーの削除</h3>
                    <p>
                        ファミリーを削除すると、すべてのデータが失われます。
                        <br />
                        この操作は取り消せません。
                    </p>
                    <Button
                        variant="destructive"
                        className="my-2"
                        onClick={() => setDeleteConfirm(true)}
                    >
                        このファミリーを削除する
                    </Button>
                </div>
                <Dialog
                    open={deleteConfirm}
                    onOpenChange={(open) => {
                        setDeleteConfirm(open);
                    }}
                >
                    <DialogContent
                        className="w-full"
                        showCloseButton={!deleteFamily.isPending}
                    >
                        <DialogHeader>
                            <DialogTitle>ファミリーの削除</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col space-y-4">
                            <p>
                                ファミリー "{family.name}"
                                を削除しようとしています。この操作は取り消すことができません。
                                <br />
                                削除すると、登録されている在庫アイテムやメンバー情報がすべて失われます。
                                <br />
                                本当に削除してもよろしいですか？
                            </p>

                            <div className="flex space-x-4">
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    onClick={() => {
                                        deleteFamily.mutate();
                                        setDeleteConfirm(false);
                                    }}
                                    disabled={deleteFamily.isPending}
                                >
                                    {deleteFamily.isPending && (
                                        <Loader2 className="animate-spin" />
                                    )}
                                    削除する
                                </Button>
                                <Button
                                    onClick={() => {
                                        setDeleteConfirm(false);
                                    }}
                                    variant="outline"
                                    disabled={deleteFamily.isPending}
                                >
                                    キャンセル
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        :   <p>Family not found.</p>;
}
