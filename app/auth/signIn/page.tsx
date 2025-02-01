import SignInProviders from "./providers";

export default async function SignIn() {
  return (
    <div className="space-y-4 flex align-center justify-center flex-col items-center mt-6">
      <h1 className="text-2xl">ログインページ</h1>

      <SignInProviders />
    </div>
  );
}
