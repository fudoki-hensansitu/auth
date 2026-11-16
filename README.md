# auth

fudoki-hensansitu のサービス（風土記など）に共通するアカウントの頁です。Google でログインし、各サービスの API キーを発行・一覧・失効します。認証とキーの管理は WorkOS に任せます。

設計は fudoki の [dd.md](https://github.com/fudoki-hensansitu/fudoki/blob/main/docs/prd/public-api-auth/dd.md) を見てください。

## QuickStart

```bash
mise install
mise exec -- bun install
mise exec -- bun run dev
```

`env.ts` の4つの値（`WORKOS_API_KEY`・`WORKOS_CLIENT_ID`・`WORKOS_COOKIE_PASSWORD`・`WORKOS_DEVELOPERS_ORG_ID`）を、gitignore 済みの `.env` に置きます。WorkOS の Dashboard には、Redirect URI（`<origin>/callback`）・sign-out の戻り先（`<origin>/`）と、widget の CORS に頁の origin を登録します。

## WorkOS の準備

- AuthKit の認証方法は Google だけを有効にする
- 全利用者が入る organization（developers）を1つ作る。ログインした利用者はここに入る
- organization の member の role に `widgets:user-api-keys:manage-self` を与える
- API キーの permission に `fudoki:read` を作る（風土記の api はこれを持つキーだけを受ける）

## License

[MIT](LICENSE)
