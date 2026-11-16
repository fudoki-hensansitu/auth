import { defineConfig } from 'void/config';

// 入口（auth.fudoki.dev）・account・routes は deploy を決めるときに足す。
export default defineConfig({
  worker: {
    compatibility_date: '2026-11-09',
  },
  cloudflare: {
    name: 'auth',
  },
});
