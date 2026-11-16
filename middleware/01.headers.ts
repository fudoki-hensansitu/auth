import { defineMiddleware } from 'void';

// 頁を他のサイトの iframe に埋めさせない（退会やキーの失効のボタンを押させる誘導を防ぐ）
export default defineMiddleware(async (c, next) => {
  await next();
  c.header('Content-Security-Policy', "frame-ancestors 'none'");
  c.header('X-Frame-Options', 'DENY');
});
