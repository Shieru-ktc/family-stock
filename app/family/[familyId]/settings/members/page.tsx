import { Member, MemberRole } from "@prisma/client";

import { auth } from "@/auth";
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
      <h1 className="text-2xl">ファミリー メンバー</h1>
      <p>
        以下は、このファミリーに所属するメンバーの一覧です。
        <br />
        管理者は、メンバーを招待したり、削除したりできます。
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
                {member.userId === session?.user.id && "（あなた）"}
              </TableCell>
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
