import { defineHandler } from 'void';
import { clearSession, currentUser, sameOrigin, workos } from '../server/workos';

export const POST = defineHandler(async (c) => {
  if (!sameOrigin(c)) return c.text('この頁から操作してください', 403);
  // WorkOS が一時的に答えなくても、手元の cookie は消してログアウトさせる
  const current = await currentUser(c).catch(() => null);
  clearSession(c);
  if (!current) return c.redirect('/');
  // WorkOS の側のセッションも終わらせ、この頁へ戻す
  // 確かめ済みのセッション ID から作る（session.getLogoutUrl は認証をやり直し、access token が切れた直後だと失敗する）
  return c.redirect(workos().userManagement.getLogoutUrl({ sessionId: current.sessionId, returnTo: new URL('/', c.req.url).toString() }));
});
