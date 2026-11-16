// WorkOS の client とセッションの cookie。ログインは AuthKit の hosted UI（Google だけを有効にする）に任せる。
import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { WorkOS } from '@workos-inc/node';
import { env } from 'void/env';

const SESSION_COOKIE = 'session';
const STATE_COOKIE = 'login_state';

export const workos = () => new WorkOS(env.WORKOS_API_KEY, { clientId: env.WORKOS_CLIENT_ID });

const cookieOptions = { path: '/', httpOnly: true, secure: true, sameSite: 'Lax' } as const;

export const callbackUrl = (c: Context) => new URL('/callback', c.req.url).toString();

/** ログインの往復で state を照合し、他のサイトから callback を踏ませない */
export function issueState(c: Context): string {
  const state = crypto.randomUUID();
  setCookie(c, STATE_COOKIE, state, { ...cookieOptions, maxAge: 600 });
  return state;
}

export function consumeState(c: Context): string | undefined {
  const state = getCookie(c, STATE_COOKIE);
  deleteCookie(c, STATE_COOKIE, cookieOptions);
  return state;
}

export const saveSession = (c: Context, sealed: string) => setCookie(c, SESSION_COOKIE, sealed, { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
export const clearSession = (c: Context) => deleteCookie(c, SESSION_COOKIE, cookieOptions);

/** ログインしている利用者。access token が切れていれば refresh し、cookie を書き直す */
export async function currentUser(c: Context) {
  const sessionData = getCookie(c, SESSION_COOKIE);
  if (!sessionData) return null;
  const session = workos().userManagement.loadSealedSession({ sessionData, cookiePassword: env.WORKOS_COOKIE_PASSWORD });
  const auth = await session.authenticate();
  if (auth.authenticated) return { user: auth.user, session };
  const refreshed = await session.refresh({ cookiePassword: env.WORKOS_COOKIE_PASSWORD });
  if (!refreshed.authenticated || !refreshed.sealedSession) {
    clearSession(c);
    return null;
  }
  saveSession(c, refreshed.sealedSession);
  return { user: refreshed.user, session: workos().userManagement.loadSealedSession({ sessionData: refreshed.sealedSession, cookiePassword: env.WORKOS_COOKIE_PASSWORD }) };
}

/** 利用者を developers の organization に入れる。WorkOS の API キーは organization に属する必要がある */
export async function joinDevelopers(userId: string): Promise<void> {
  const client = workos();
  const memberships = await client.userManagement.listOrganizationMemberships({ userId, organizationId: env.WORKOS_DEVELOPERS_ORG_ID });
  if (memberships.data.length > 0) return;
  await client.userManagement.createOrganizationMembership({ userId, organizationId: env.WORKOS_DEVELOPERS_ORG_ID });
}
