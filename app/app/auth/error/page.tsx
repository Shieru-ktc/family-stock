import { CircleX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { error } = await searchParams;
  let errorMessage;
  switch (error) {
    case "inactiveAccount":
      errorMessage = "このアカウントは無効化されています。";
      break;
    default:
      errorMessage = "ログイン中にエラーが発生しました。";
      break;
  }
  return (
    <div className="mx-auto rounded-xl bg-red-300 p-12 text-center text-red-950 shadow-xl dark:bg-red-950 dark:text-red-200">
      <h1 className="inline-flex items-center text-2xl">
        <CircleX className="mr-2" /> Login Failed
      </h1>
      <p>
        ご迷惑をおかけしてしまい申し訳ございません。
        <br />
        ログイン処理中にエラーが発生したため、ログインできませんでした。
      </p>
      <p>エラー: {errorMessage}</p>
      <hr className="my-3 h-[1px] border-none bg-red-400" />
      <p>
        時間をおいて再度お試しください。問題が解決しない場合は、
        <Link href="/app/contact" className="font-bold underline">
          サポートにご連絡ください。
        </Link>
      </p>
      <Button
        asChild
        className="mt-3 border-none bg-red-400 text-red-950 hover:bg-red-200 hover:text-red-700"
        variant={"outline"}
      >
        <Link href="/app/auth/signIn">ログインページに戻る</Link>
      </Button>
    </div>
  );
}
