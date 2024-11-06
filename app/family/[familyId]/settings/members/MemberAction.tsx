"use client";

import ActionButtons from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { Family, Member } from "@prisma/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { link } from "fs";
import { useState } from "react";

export default function MemberActionComponent({
  family,
  member,
}: {
  family: Family;
  member: Member;
}) {
  const [isOpen, setIsOpen] = useState(false);

  function onEditClick() {
    console.log("edit");
  }

  function onDeleteClick() {
    console.log("delete");
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>メンバーの編集</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <TableCell className="flex space-x-4">
        <ActionButtons
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      </TableCell>
    </>
  );
}
