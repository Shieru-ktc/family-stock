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
import AddMember from "../../members/AddMember";
import MemberActionComponent from "../../members/MemberAction";

export default async function InvitesPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const familyId = (await params).familyId;
  const family = await prisma.family.findFirstOrThrow({
    where: {
      id: familyId,
    },
    include: {
      Invites: {
        include: {
          CreatedBy: true,
        },
      },
    },
  });
  const invites = family.Invites;

  return (
    <div>
      <h1 className="text-2xl">発行された招待</h1>
      <p>
        以下は、このファミリーに対して発行された招待リンクです。作成から一週間が経過した招待は無効になります。
        <br />
        管理者は、この画面からいつでも削除できます。
      </p>
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
          {invites.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell>{invite.id}</TableCell>
              <TableCell>{invite.createdAt.toLocaleString()}</TableCell>
              <TableCell>{invite.CreatedBy.name}</TableCell>
              <TableCell></TableCell>
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
