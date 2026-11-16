import { defineHandler, type InferProps } from 'void';
import { currentUser } from '../server/workos';

// widget はブラウザでだけ動くので、頁はブラウザで描く
export const ssr = false;

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  c.header('Cache-Control', 'no-store');
  const current = await currentUser(c);
  return { email: current?.user.email ?? null };
});
