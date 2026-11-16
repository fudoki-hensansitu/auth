import { defineEnv, string } from 'void/env';

// repo は public なので、WorkOS の値はすべて env で受ける（AGENTS.md の secret）。
// 本番は `void secret put <名前>`、手元は gitignore 済みの `.env` に置く。
export default defineEnv({
  /** WorkOS の API key（sk_…）。ログインの処理・organization への所属・widget の token の発行に使う */
  WORKOS_API_KEY: string(),
  /** AuthKit の client ID */
  WORKOS_CLIENT_ID: string(),
  /** セッションの cookie を封じる鍵。32 文字以上 */
  WORKOS_COOKIE_PASSWORD: string(),
  /** 全利用者が入る organization（developers）の ID。API キーはこの organization に属する */
  WORKOS_DEVELOPERS_ORG_ID: string(),
});
