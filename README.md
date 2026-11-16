# auth

fudoki-hensansitu のサービス（風土記など）に共通するアカウントの頁です。Google でログインし、各サービスの API キーを発行・一覧・失効します。認証とキーの管理は WorkOS に任せます。

いまは雛形だけで、実装は WorkOS の環境ができてから進めます。設計は fudoki の [dd.md](https://github.com/fudoki-hensansitu/fudoki/blob/main/docs/prd/public-api-auth/dd.md) を見てください。

## QuickStart

```bash
mise install
mise exec -- bun install
mise exec -- bun run dev
```

## License

[MIT](LICENSE)
