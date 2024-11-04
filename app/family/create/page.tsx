import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function FamilyCreatePage() {
  const session = await auth();
  return (
    <div>
      <h1 className="text-2xl">ファミリーを作成</h1>
      <p>ファミリーを作成すると、家族全員で在庫状況を管理できます。</p>
      <Button
        onClick={async () => {
          "use server";
          const family = await prisma.family.create({
            data: {
              name: "My Family",
              Members: {
                create: {
                  User: {
                    connect: {
                      email: session?.user.email,
                    },
                  },
                },
              },
              Owner: {
                connect: {
                  email: session?.user.email,
                },
              },
            },
          });
          console.log(family);
        }}
      >
        ファミリーを作成する
      </Button>
    </div>
  );
}
