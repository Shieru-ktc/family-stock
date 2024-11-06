"use client";

import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { Family, Member } from "@prisma/client";
import { Edit2, Trash2 } from "lucide-react";

export default function MemberActionComponent({
  family,
  member,
}: {
  family: Family;
  member: Member;
}) {
  return (
    <TableCell className="flex space-x-4">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          console.log("Edit member", member);
        }}
      >
        <Edit2 />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          console.log("Delete member", member);
        }}
      >
        <Trash2 />
      </Button>
    </TableCell>
  );
}
