# auth

fudoki-hensansitu のサービス（風土記など）に共通するアカウントの頁です。Google でログインし、各サービスの API キーを発行・一覧・失効します。認証とキーの管理は WorkOS に任せます。

設計は fudoki の [dd.md](https://github.com/fudoki-hensansitu/fudoki/blob/main/docs/prd/public-api-auth/dd.md) を見てください。

## QuickStart

```bash
mise install
mise exec -- bun install
fnox exec --if-missing error -- mise exec -- bun run dev
```

`env.ts` の値（preview の WorkOS）は `fnox.toml` に暗号化してあり、`fnox exec` で起動すると env に入ります。WorkOS の Dashboard には、Redirect URI（`<origin>/callback`）・sign-out の戻り先（`<origin>/`）と、widget の CORS に頁の origin を登録します。

## WorkOS の準備

- AuthKit の認証方法は Google だけを有効にする
- 全利用者が入る organization（developers）を1つ作る。ログインした利用者はここに入る
- organization の member の role に、自分の API キーを管理する widget の permission を与える
- 各サービスの api が受ける API キーの permission を作る（名前は非公開の手順書に置く）

## License

[MIT](LICENSE)
