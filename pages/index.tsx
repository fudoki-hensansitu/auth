import '@radix-ui/themes/styles.css';
import '@workos-inc/widgets/styles.css';
import './index.css';
import { ApiKeys, WorkOsWidgets } from '@workos-inc/widgets';
import type { Props } from './index.server';

async function widgetToken(): Promise<string> {
  const res = await fetch('/widget-token', { cache: 'no-store' });
  if (!res.ok) throw new Error('API キーの欄を開けませんでした。頁を読み込み直してください');
  return ((await res.json()) as { token: string }).token;
}

export default function Account({ email, unavailable }: Props) {
  if (unavailable) {
    return (
      <main className="page">
        <h1>API キー</h1>
        <p>ログインの確認ができませんでした。時間をおいて頁を読み込み直してください。</p>
      </main>
    );
  }
  if (!email) {
    return (
      <main className="page">
        <h1>API キーの発行</h1>
        <p>風土記などの API を呼ぶためのキーを発行します。Google アカウントでログインしてください。</p>
        <a className="button" href="/login">
          Google でログイン
        </a>
      </main>
    );
  }
  return (
    <main className="page">
      <header className="bar">
        <span>{email}</span>
        <form method="post" action="/logout">
          <button type="submit">ログアウト</button>
        </form>
      </header>
      <h1>API キー</h1>
      <p>キーは発行したときに一度だけ表示されます。漏れたキーはここで失効させてください（効くまで最長 5 分）。</p>
      <WorkOsWidgets>
        <ApiKeys authToken={widgetToken} scope="user" />
      </WorkOsWidgets>
      <section className="danger">
        <h2>退会</h2>
        <p>アカウントを削除すると、発行した API キーはすべて使えなくなります。</p>
        <form
          method="post"
          action="/account/delete"
          onSubmit={(e) => {
            if (!confirm('アカウントを削除します。発行した API キーはすべて使えなくなります。よろしいですか？')) e.preventDefault();
          }}
        >
          <button type="submit">アカウントを削除する</button>
        </form>
      </section>
    </main>
  );
}
