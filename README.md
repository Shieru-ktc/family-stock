# Family Stock - 家庭用在庫管理アプリ

このアプリは、家庭の在庫管理と買い物を容易にするための Web アプリケーションです。

## 目的

買い物中の「今家に何があったっけ？」や「これまだ家に合ったかな？」といった悩みを解決するために作成しました。

## アプリケーションを実行する

> [!NOTE]
> パッケージマネージャーには`bun`を利用しています。  
> npm, yarn, pnpmなどその他のパッケージマネージャーを利用する場合は、適宜読み替えてください。

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
bun i
```

アプリケーションを開発モードで起動します。

```bash
bun dev
```

プロダクションビルドが必要な場合は、以下を実行してください:

```bash
bun build
bun start
```

その際、`.env`をホスト先に合わせて設定してください。例えば:

```ini
DATABASE_URL="postgresql://family-stock:password@postgres.example.com:5432/family-stock"

NEXTAUTH_URL=https://family-stock.example.com

# (Truncated)

HOSTNAME="family-stock.example.com"
PORT="443"
```

APIサーバーは、以下で実行できます:

```bash
bun api
```
