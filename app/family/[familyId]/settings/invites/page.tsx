"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InviteActionComponent from "./InviteActionComponent";
import { useQuery } from "@tanstack/react-query";
import { Family, Invite, Member, User } from "@prisma/client";
import React from "react";

export default function InvitesPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const familyId = React.use(params).familyId;
  const { data, isPending } = useQuery({
    queryKey: ["family", familyId, "invites"],
    queryFn: () =>
      fetch(`/api/family/${familyId}/invites`).then((res) => res.json()),
    select: (data) => {
      console.log(data);
      return data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl">発行された招待</h1>
      <p>
        以下は、このファミリーに対して発行された招待リンクです。作成から一週間が経過した招待は無効になります。
        <br />
        管理者は、この画面からいつでも削除できます。
      </p>

      {isPending ? (
        <p>Loading ...</p>
      ) : data?.success ? (
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
            {data.map(
              (
                invite: Invite & {
                  CreatedBy: User;
                  Family: Family & {
                    Members: Member[];
                  };
                }
              ) => (
                <TableRow key={invite.id}>
                  <TableCell>{invite.id}</TableCell>
                  <TableCell>{invite.createdAt.toLocaleString()}</TableCell>
                  <TableCell>{invite.CreatedBy.name}</TableCell>
                  <InviteActionComponent invite={invite} />
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      ) : (
        <p>{data.error}</p>
      )}
    </div>
  );
}
