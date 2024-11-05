import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FamilyJoinPage() {
  return (
    <div>
      <h1>ファミリーに参加する</h1>
      <p>
        ファミリーに参加するには、ファミリーの管理者が提供する招待リンクか、招待コードが必要です。
      </p>
      <form
        action={async (data: FormData) => {
          "use server";
          console.log(data);
        }}
      >
        <label>
          招待リンク:
          <Input type="text" name="link" />
        </label>
        <Button type="submit">参加する</Button>
      </form>
    </div>
  );
}
