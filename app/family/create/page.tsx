import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";

export default async function FamilyCreatePage() {
  const session = await auth();
  return (
    <div>
      <h1 className="text-2xl">ファミリーを作成</h1>
      <p>ファミリーを作成すると、家族全員で在庫状況を管理できます。</p>
      <form
        action={async (formData) => {
          "use server";
          const family = await prisma.family.create({
            data: {
              name: formData.get("name")?.toString() || "My Family",
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
        <label>
          ファミリー名:
          <Input type="text" name="name" />
        </label>
        <Button type="submit">作成する</Button>
      </form>
    </div>
  );
}
