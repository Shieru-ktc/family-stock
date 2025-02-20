"use client";

import { ReactNode, use } from "react";

import { prisma } from "@/lib/prisma";
import FamilyPageAtomSetter from "./atomSetter";
import { useAtomValue } from "jotai";
import { sessionAtom } from "@/atoms/sessionAtom";

export default function FamilyPageLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ familyId: string }>;
}) {
  const session = useAtomValue(sessionAtom)
  const familyId = use(params).familyId;

  // TODO: middlewareでやるべき…？
  const member = prisma.member.findFirst({
    where: {
      familyId,
      userId: session?.user?.id,
      Family: {
        active: true,
      },
    },
  });
  return <p>working</p>
  if (true) {
    return (
      <>
        <FamilyPageAtomSetter familyId={familyId}>
          {children}
        </FamilyPageAtomSetter>
      </>
    );
  } else {
    return (
      <div>
        <h1 className="text-2xl">ファミリーが見つかりませんでした</h1>
        <p>
          申し訳ありませんが、要求されたファミリーにはアクセスできません。以下の理由が考えられます:
        </p>
        <ul className="my-2 list-disc pl-8">
          <li>ファミリーが存在しないまたは削除された</li>
          <li>ファミリーのメンバーに追加されていない</li>
        </ul>
      </div>
    );
  }
}
