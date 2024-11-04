import { prisma } from "@/lib/prisma";
import { Family } from "@prisma/client";

export default async function FamilySettingsPage({
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
      Members: {
        include: {
          User: true,
        },
      },
    },
  });
  return (
    <div>
      <h1>Family Settings</h1>
      <p>Family ID: {family.id}</p>
      <p>Family Name: {family.name}</p>
      <p>Family Members:</p>
      <ul>
        {family.Members.map((member) => (
          <li key={member.id}>
            {member.User.name} - {member.User.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
