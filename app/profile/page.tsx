import { auth } from "@/auth";

export default async function ProfilePage() {
  const session = await auth();
  return (
    <div>
      <h1>{session?.user.name}'s Profile</h1>
    </div>
  );
}
