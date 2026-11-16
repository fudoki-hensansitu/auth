import { defineHandler } from 'void';
import { env } from 'void/env';
import { currentUser, workos } from '../server/workos';

// API Keys widget の token。本人のキーだけを扱える scope にし、ログインしている利用者にだけ出す。
// widget は token が切れると取り直すので、頁に埋めずにここから渡す
export const GET = defineHandler(async (c) => {
  const current = await currentUser(c);
  if (!current) return c.json({ error: 'ログインしてください' }, 401);
  const { token } = await workos().widgets.createToken({
    organizationId: env.WORKOS_DEVELOPERS_ORG_ID,
    userId: current.user.id,
    scopes: ['widgets:user-api-keys:manage-self'],
  });
  c.header('Cache-Control', 'no-store');
  return { token };
});
