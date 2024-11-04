import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import React from "react";
import { ReactNode } from "react";

export default async function FamilyPageLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ familyId: string }>;
}) {
  const session = await auth();
  const familyId = (await params).familyId;

  // TODO: middlewareでやるべき…？
  const member = await prisma.member.findFirst({
    where: {
      familyId,
      userId: session?.user.id,
    },
  });
  if (member) {
    return children;
  } else {
    return <div>Not a member of this family</div>;
  }
}
