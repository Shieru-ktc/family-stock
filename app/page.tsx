import AuthButtons from "@/components/AuthButtons";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  return <AuthButtons session={session} />;
}
