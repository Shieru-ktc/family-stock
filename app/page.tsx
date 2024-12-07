import { auth } from "@/auth";
import AuthButtons from "@/components/AuthButtons";

export default async function Home() {
  const session = await auth();
  return <AuthButtons session={session} />;
}
