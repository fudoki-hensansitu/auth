// WorkOS の client とセッションの cookie。ログインは AuthKit の hosted UI（Google だけを有効にする）に任せる。
import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { WorkOS } from '@workos-inc/node';
import { env } from 'void/env';

// __Host- を付け、隣のサブドメイン（*.fudoki.dev）から cookie を置かせない（login CSRF を防ぐ）
const SESSION_COOKIE = '__Host-session';
const STATE_COOKIE = '__Host-login_state';

// isolate の中で使い回し、SDK が持つ JWKS のキャッシュを要求をまたいで残す。利用者ごとのセッションは要求の中だけで作る
let client: WorkOS | undefined;
export const workos = () => (client ??= new WorkOS(env.WORKOS_API_KEY, { clientId: env.WORKOS_CLIENT_ID }));

const cookieOptions = { path: '/', httpOnly: true, secure: true, sameSite: 'Lax' } as const;

/** WorkOS が一時的に答えない。cookie は残し、時間をおいてもらう */
export class SessionUnavailable extends Error {}

/**
 * 状態を変える POST が自分の頁から来たことを確かめる。SameSite=Lax は同じ site（*.fudoki.dev の他のサブドメイン）からの POST に cookie を送るので、Origin で絞る
 */
export function sameOrigin(c: Context): boolean {
  const origin = c.req.header('origin');
  if (origin) return origin === new URL(c.req.url).origin;
  return c.req.header('sec-fetch-site') === 'same-origin';
}

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
  if (auth.authenticated) return { user: auth.user, sessionId: auth.sessionId };
  const refreshed = await session.refresh({ cookiePassword: env.WORKOS_COOKIE_PASSWORD });
  if (!refreshed.authenticated && 'retryable' in refreshed && refreshed.retryable) throw new SessionUnavailable();
  if (!refreshed.authenticated || !refreshed.sealedSession) {
    clearSession(c);
    return null;
  }
  saveSession(c, refreshed.sealedSession);
  return { user: refreshed.user, sessionId: refreshed.sessionId };
}

/** 利用者を developers の organization に入れる。WorkOS の API キーは organization に属する必要がある */
export async function joinDevelopers(userId: string): Promise<void> {
  const client = workos();
  const memberships = await client.userManagement.listOrganizationMemberships({ userId, organizationId: env.WORKOS_DEVELOPERS_ORG_ID });
  if (memberships.data.length > 0) return;
  await client.userManagement.createOrganizationMembership({ userId, organizationId: env.WORKOS_DEVELOPERS_ORG_ID });
}
