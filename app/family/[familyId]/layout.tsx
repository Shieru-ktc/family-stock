import { ReactNode } from "react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
      Family: {
        active: true,
      },
    },
  });
  if (member) {
    return children;
  } else {
    return (
      <div>
        <h1 className="text-2xl">ファミリーが見つかりませんでした</h1>
        <p>
          申し訳ありませんが、要求されたファミリーにはアクセスできません。以下の理由が考えられます:
        </p>
        <ul className="list-disc pl-8 my-2">
          <li>ファミリーが存在しないまたは削除された</li>
          <li>ファミリーのメンバーに追加されていない</li>
          <li>ファミリーがアクティブになっている</li>
        </ul>
      </div>
    );
  }
}
