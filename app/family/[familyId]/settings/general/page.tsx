"use client";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Member, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";

export default function FamilySettingsPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = use(params);
  const { data: family } = useQuery({
    queryKey: ["family", familyId],
    queryFn: () => fetch(`/api/family/${familyId}`).then((res) => res.json()),
  });
  return family ? (
    <div>
      <h1>Family Settings</h1>
      <p>Family ID: {family.id}</p>
      <p>Family Name: {family.name}</p>
      <p>Family Members:</p>
      <ul>
        {family.Members.map((member: Member & { User: User }) => (
          <li key={member.id}>
            {member.User.name} - {member.User.email}
          </li>
        ))}
      </ul>
      <Button
        variant="destructive"
        onClick={() => {
          fetch(`/api/family/${familyId}`, {
            method: "DELETE",
          });
        }}
      >
        Delete Family
      </Button>
    </div>
  ) : (
    <p>Family not found</p>
  );
}
