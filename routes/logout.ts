import { defineHandler } from 'void';
import { clearSession, currentUser, sameOrigin } from '../server/workos';

export const POST = defineHandler(async (c) => {
  if (!sameOrigin(c)) return c.text('この頁から操作してください', 403);
  const current = await currentUser(c);
  clearSession(c);
  if (!current) return c.redirect('/');
  // WorkOS の側のセッションも終わらせ、この頁へ戻す
  return c.redirect(await current.session.getLogoutUrl({ returnTo: new URL('/', c.req.url).toString() }));
});
