import { defineHandler } from 'void';
import { env } from 'void/env';
import { callbackUrl, issueState, workos } from '../server/workos';

// AuthKit の hosted UI へ送る。Google 以外の方法は WorkOS の設定で無効にしておく
export const GET = defineHandler((c) => {
  const url = workos().userManagement.getAuthorizationUrl({
    provider: 'authkit',
    clientId: env.WORKOS_CLIENT_ID,
    redirectUri: callbackUrl(c),
    state: issueState(c),
  });
  return c.redirect(url);
});
