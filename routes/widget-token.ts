import { defineHandler } from 'void';
import { env } from 'void/env';
import { currentUser, SessionUnavailable, workos } from '../server/workos';

// API Keys widget の token。本人のキーだけを扱える scope にし、ログインしている利用者にだけ出す。
// widget は token が切れると取り直すので、頁に埋めずにここから渡す
export const GET = defineHandler(async (c) => {
  const current = await currentUser(c).catch((e) => {
    if (e instanceof SessionUnavailable) return 'unavailable' as const;
    throw e;
  });
  if (current === 'unavailable') return c.json({ error: '時間をおいて試してください' }, 503);
  if (!current) return c.json({ error: 'ログインしてください' }, 401);
  const { token } = await workos().widgets.createToken({
    organizationId: env.WORKOS_DEVELOPERS_ORG_ID,
    userId: current.user.id,
    scopes: ['widgets:user-api-keys:manage-self'],
  });
  // 素の object を返すと Void が context の header を捨て、refresh で回したセッションの cookie も落ちる
  return c.json({ token }, 200, { 'Cache-Control': 'no-store' });
});
