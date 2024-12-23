export default function HttpError({ code }: { code: number }) {
  if (code === 403) {
    return ForbiddenError();
  }
  return <p>Status Code: {code}</p>;
}

export function ForbiddenError() {
  return (
    <div className="p-5 text-center bg-red-200 dark:bg-rose-950">
      <p className="text-2xl text-red-500">権限が必要です</p>
      <p>申し訳ありませんが、これを表示する権限がありません。</p>
      <p>
        アカウントを替えてお試しいただくか、ファミリーの管理者またはサポートセンターにお問い合わせください。
      </p>
    </div>
  );
}
