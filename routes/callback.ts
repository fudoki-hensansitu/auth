import { defineHandler } from 'void';
import { env } from 'void/env';
import { consumeState, joinDevelopers, saveSession, workos } from '../server/workos';

export const GET = defineHandler(async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');
  const expected = consumeState(c);
  if (!code || !state || state !== expected) return c.text('ログインをやり直してください', 400);

  const auth = await workos().userManagement.authenticateWithCode({
    code,
    clientId: env.WORKOS_CLIENT_ID,
    session: { sealSession: true, cookiePassword: env.WORKOS_COOKIE_PASSWORD },
  });
  await joinDevelopers(auth.user.id);
  saveSession(c, auth.sealedSession!);
  return c.redirect('/');
});
