"use client";

import { Member, User } from "@prisma/client";

import { familyAtom } from "@/atoms/familyAtom";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";

export default function FamilySettingsPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const [family] = useAtom(familyAtom);

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
          fetch(`/api/family/${family.id}`, {
            method: "DELETE",
          });
        }}
      >
        Delete Family
      </Button>
    </div>
  ) : (
    <p>Family not found.</p>
  );
}
