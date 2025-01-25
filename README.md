# Family Stock - 家庭用在庫管理アプリ

このアプリは、家庭の在庫管理と買い物を容易にするための Web アプリケーションです。

## 目的

買い物中の「今家に何があったっけ？」や「これまだ家に合ったかな？」といった悩みを解決するために作成しました。

## アプリケーションを実行する

`.env`の名前で、以下の内容を書き込みます:

```ini
DATABASE_URL="postgresql://user:pass@localhost:5432/database" # 内容は適宜置き換えてください

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="aBcDeF12345"

GITHUB_ID="AbCdEfGhI12345"
GITHUB_SECRET="4fca3022d24548bc455955758a38775f8ffb0487a4a4879f33a1139b6d4cb9c2"

DISCORD_ID="1234567890"
DISCORD_SECRET="e5cfa7dbbc1a95c8771ca81db90ff838"

HOSTNAME="localhost"
PORT="3000"
```

依存関係をインストールします。

```bash
pnpm install
```

アプリケーションを開発モードで起動します。

```bash
pnpm run dev
```

プロダクションビルドが必要な場合は、以下を実行してください:

```bash
pnpm run build
pnpm start
```
