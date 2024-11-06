"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, FormEvent } from "react";
import { checkInvite, joinInvite, ValidateStatus } from "./actions";

export default function FamilyJoinPage() {
  const [fetchStatus, setFetchStatus] = useState<ValidateStatus | null>(null);

  const handleValidate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const link = formData.get("link")?.toString() || "";

    // Server Actionを呼び出し、エラーメッセージを設定
    const res = await checkInvite(link);
    console.log(res);
    setFetchStatus(res);
  };

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fetchStatus?.success) {
      const res = await joinInvite(fetchStatus.invite.id);
      console.log(res);
    }
  };

  return (
    <div>
      <h1>ファミリーに参加する</h1>
      <p>
        参加するには、ファミリーの管理者が提供する招待リンクか、招待コードが必要です。
      </p>
      <form onSubmit={handleValidate}>
        <label>
          招待リンク:
          <Input type="text" name="link" />
        </label>
        <Button type="submit">招待リンクを確認</Button>
      </form>
      {fetchStatus &&
        (fetchStatus?.success ? (
          <Alert>
            <AlertTitle>
              ファミリー {fetchStatus.invite.Family.name} に招待されています。
            </AlertTitle>
            <AlertDescription className="my-4">
              <p>
                ファミリーに参加するには、以下のボタンをクリックしてください。
              </p>
              <form onSubmit={handleJoin}>
                <Button>参加する</Button>
              </form>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">{fetchStatus?.message}</Alert>
        ))}
    </div>
  );
}
