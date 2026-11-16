import { defineHandler } from 'void';
import { clearSession, currentUser } from '../server/workos';

export const POST = defineHandler(async (c) => {
  const current = await currentUser(c);
  clearSession(c);
  if (!current) return c.redirect('/');
  // WorkOS の側のセッションも終わらせ、この頁へ戻す
  return c.redirect(await current.session.getLogoutUrl({ returnTo: new URL('/', c.req.url).toString() }));
});
