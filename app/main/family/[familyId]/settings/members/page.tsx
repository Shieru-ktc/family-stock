"use client";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { familyAtom } from "@/atoms/familyAtom";
import { sessionAtom } from "@/atoms/sessionAtom";
import { getRoleLabel } from "@/lib/utils";
import { useAtomValue } from "jotai";
import AddMember from "./AddMember";
import MemberActionComponent from "./MemberAction";

export default function FamilyMembersPage() {
    const session = useAtomValue(sessionAtom);
    const family = useAtomValue(familyAtom);
    if (family) {
        const members = family.Members;

        return (
            <div>
                <h1 className="text-2xl">ファミリー メンバー</h1>
                <p>
                    以下は、このファミリーに所属するメンバーの一覧です。
                    <br />
                    管理者は、メンバーを招待したり、削除したりできます。
                </p>
                <p className="my-2">
                    お使いのプランでは、最大 {family.Config.maxMembersPerFamily}{" "}
                    人のメンバーを追加できます。
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                        （残り{" "}
                        {family.Config.maxMembersPerFamily - members.length}人）
                    </span>
                </p>
                <Table>
                    <TableCaption>ファミリー メンバーの一覧</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ユーザー名</TableHead>
                            <TableHead>ロール</TableHead>
                            <TableHead>アクション</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    {member.User.name}{" "}
                                    {member.userId === session?.user?.id &&
                                        "（あなた）"}
                                </TableCell>
                                <TableCell>
                                    {getRoleLabel(member, family.ownerId)}
                                </TableCell>
                                <MemberActionComponent
                                    family={family}
                                    member={member}
                                />
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <AddMember family={family} />
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        );
    }
}
