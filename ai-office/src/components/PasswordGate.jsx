import { useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'aioffice:auth';
const FAIL_KEY = 'aioffice:auth_fails';
const LOCK_UNTIL_KEY = 'aioffice:auth_lock_until';
const LOCK_SECONDS = 30;
const MAX_FAILS = 3;

export default function PasswordGate({ children }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [lockRemaining, setLockRemaining] = useState(0);
  const inputRef = useRef(null);

  const appPassword = import.meta.env.VITE_APP_PASSWORD;

  useEffect(() => {
    if (!authed) inputRef.current?.focus();
  }, [authed]);

  useEffect(() => {
    if (lockRemaining <= 0) return;
    const t = setInterval(() => {
      setLockRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          localStorage.removeItem(LOCK_UNTIL_KEY);
          localStorage.removeItem(FAIL_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [lockRemaining]);

  useEffect(() => {
    const lockUntil = Number(localStorage.getItem(LOCK_UNTIL_KEY) || 0);
    const remain = Math.ceil((lockUntil - Date.now()) / 1000);
    if (remain > 0) setLockRemaining(remain);
  }, []);

  if (authed) return children;

  function handleSubmit(e) {
    e.preventDefault();
    if (lockRemaining > 0) return;

    if (!appPassword) {
      setError('VITE_APP_PASSWORD が設定されていません(.env.local を確認してください)');
      return;
    }

    if (value === appPassword) {
      sessionStorage.setItem(SESSION_KEY, '1');
      localStorage.removeItem(FAIL_KEY);
      localStorage.removeItem(LOCK_UNTIL_KEY);
      setAuthed(true);
      return;
    }

    const fails = Number(localStorage.getItem(FAIL_KEY) || 0) + 1;
    localStorage.setItem(FAIL_KEY, String(fails));
    setValue('');

    if (fails >= MAX_FAILS) {
      const until = Date.now() + LOCK_SECONDS * 1000;
      localStorage.setItem(LOCK_UNTIL_KEY, String(until));
      setLockRemaining(LOCK_SECONDS);
      setError(`${MAX_FAILS}回連続で失敗しました。${LOCK_SECONDS}秒後に再試行してください。`);
    } else {
      setError(`パスワードが違います(あと${MAX_FAILS - fails}回)`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <form
        onSubmit={handleSubmit}
        className="app-card w-full max-w-[340px] text-center"
      >
        <div className="text-4xl mb-2">🔒</div>
        <h1 className="text-base font-bold mb-1">🐝 蜂の巣駆除産業|AIオフィス</h1>
        <p className="text-xs text-ink/60 mb-4">パスワードを入力してください</p>
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          className="app-input mb-3 text-center"
          placeholder="パスワード"
          value={value}
          disabled={lockRemaining > 0}
          onChange={(e) => setValue(e.target.value)}
        />
        {error && <p className="text-warn text-xs mb-3">{error}</p>}
        {lockRemaining > 0 && (
          <p className="text-warn text-xs mb-3">ロック中… 残り{lockRemaining}秒</p>
        )}
        <button type="submit" className="app-btn-primary w-full" disabled={lockRemaining > 0}>
          入る →
        </button>
      </form>
    </div>
  );
}
