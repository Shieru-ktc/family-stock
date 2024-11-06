import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
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
import { prisma } from "@/lib/prisma";
import { Member, MemberRole } from "@prisma/client";
import { DeleteIcon, Edit2, PlusCircle, Trash2 } from "lucide-react";
import AddMember from "./AddMember";
import MemberActionComponent from "./MemberAction";

export default async function FamilyMembersPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const session = await auth();
  const familyId = (await params).familyId;
  const family = await prisma.family.findFirstOrThrow({
    where: {
      id: familyId,
    },
    include: {
      Members: {
        include: {
          User: true,
        },
      },
    },
  });
  const members = family.Members;

  function getRoleLabel(member: Member) {
    if (family.ownerId == member.userId) {
      return "オーナー";
    } else if (member.role == MemberRole.ADMIN) {
      return "管理者";
    } else {
      return "メンバー";
    }
  }
  return (
    <div>
      <p>Family ID: {familyId}</p>
      <Table>
        <TableCaption>ファミリー メンバーの一覧</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ユーザー名</TableHead>
            <TableHead>参加日時</TableHead>
            <TableHead>ロール</TableHead>
            <TableHead>アクション</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                {member.User.name}{" "}
                {member.userId === session?.user.id && "（あなた）"}
              </TableCell>
              <TableCell>{member.createdAt.toLocaleString("ja-JP")}</TableCell>
              <TableCell>{getRoleLabel(member)}</TableCell>
              <MemberActionComponent family={family} member={member} />
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
