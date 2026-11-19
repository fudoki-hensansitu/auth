# auth

風土記（fudoki）や補助金など、fudoki-hensansitu のサービスに共通するアカウントの頁。Cloudflare Worker を1つ作り `auth.fudoki.dev` で出す。持つ機能は Google ログインと、API キーの発行・一覧・失効だけで、どちらも WorkOS（AuthKit と、user scope の API Keys widget）に任せる。退会は WorkOS の利用者削除で行う。fudoki 以外のサービスのキーも同じ頁で発行するので、fudoki とは別の repo にしている。

設計の正本は fudoki の [dd.md](https://github.com/fudoki-hensansitu/fudoki/blob/main/docs/prd/public-api-auth/dd.md)（「アカウントの頁（別 repo）」節）と [ADR 0044](https://github.com/fudoki-hensansitu/fudoki/blob/main/docs/adr/0044-separate-web-and-public-api.md)。

## ディレクトリ構造

```
.
├── pages/           # 頁（React）。ログイン前の案内と、API Keys widget・ログアウト・退会
├── routes/          # Void の route。ログイン（/login・/callback）・/logout・/account/delete・/widget-token
├── middleware/      # 全応答の header（iframe に埋めさせない）
├── server/          # WorkOS の client とセッションの cookie（__Host-）・POST の Origin の検査
├── docs/            # この repo の設計・判断（tracked）
├── env.ts           # WorkOS の値の schema（値は .env と Void の secret）
├── void.config.ts   # Worker 名（auth）。入口・account は deploy を決めるときに足す
└── vite.config.ts
```

## セットアップ

ツールは mise で管理している。

```bash
mise install
mise exec -- bun install
mise exec -- bun run dev     # vite dev
mise exec -- bun run check   # 型検査
```

依存は exact ピン留めにし、公開から7日未満の版は `bunfig.toml`（`minimumReleaseAge`）で解決から外す。セキュリティ修正は cooldown の例外として直ちに入れ、例外を解除できる日時を PR 本文に書く。

## secret

- 手元で使う secret は root の `fnox.toml` に age で暗号化して commit する（[fnox](https://fnox.jdx.dev/)）。鍵は auth 専用にし、個人の age 鍵を recipient に入れない。鍵の作り方・メンバーや agent の追加・値の登録と rotate は home repo（`fudoki-hensansitu/home`）の secrets skill に従う。今は値が無いので `fnox.toml` も無い
- repo は public なので、secret だけでなく WorkOS の organization ID・permission 名・client ID などの設定値も tracked なファイルに入れない。実行時に env（Worker の secret・var）で受ける
- WorkOS の API key・client secret はこの repo に入れない（`fnox.toml` にも入れない）。本番の Worker の secret は Cloudflare に置く。WorkOS のアカウント・環境・secret は yuito が持つ

## 技術スタック

- Bun + TypeScript
- [Void](https://void.cloud)（Cloudflare Worker `auth`）。`void.lock.json` は Void が生成したら commit する
- WorkOS AuthKit（`@workos-inc/node`、セッションは封じた cookie）・API Keys widget（`@workos-inc/widgets`、user scope）
- Void の pages（`@void/react`）

## Skills

- Void でアプリを作る・CLI を使うとき → `.agents/skills/void/`（`voidzero-dev/void` から skillctrl で取得。取得元と hash は `skills-lock.json`・`.agents/skillctrl/`）。Claude Code へは `.claude/skills/` の相対 symlink で渡す
- WorkOS（AuthKit・API キー・セッション）を触るとき → `.agents/skills/workos/`、API Keys widget を触るとき → `.agents/skills/workos-widgets/`（どちらも `workos/skills` から skillctrl で取得。取得元と hash は同上、license は `THIRD_PARTY_NOTICES.md`）

## レビュー

- PR レビューは Pullfrog。初回レビューは自動、追加コミットの再レビューは無効。追加レビューは必要時に `@pullfrog` で依頼する。PR の merge で Pullfrog を待たなくてよい
- 設定の正本は `.github/pullfrog.config.sh`（backend の値は git から見えないので、変えるときはこの script を直して実行する）。model・effort・instructions は org の既定を継承する
