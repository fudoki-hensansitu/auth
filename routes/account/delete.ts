import { defineHandler } from 'void';
import { clearSession, currentUser, sameOrigin, workos } from '../../server/workos';

// 退会。WorkOS の利用者を消すと organization の所属が消え、発行した API キーも失効する
export const POST = defineHandler(async (c) => {
  if (!sameOrigin(c)) return c.text('この頁から操作してください', 403);
  const current = await currentUser(c);
  if (!current) return c.redirect('/');
  await workos().userManagement.deleteUser(current.user.id);
  clearSession(c);
  return c.redirect('/');
});
