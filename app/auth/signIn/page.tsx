import SignInProviders from "./providers";

export default async function SignIn() {
  return (
    <div>
      <h1>ログインページ</h1>

      <SignInProviders />
    </div>
  );
}
