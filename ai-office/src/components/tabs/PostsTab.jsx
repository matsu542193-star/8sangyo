import { posts } from '../../data/portalData';
import { copyText } from '../../lib/clipboard';
import { useToast } from '../../lib/ToastContext';

export default function PostsTab() {
  const showToast = useToast();

  async function handleCopy(text) {
    const ok = await copyText(text);
    showToast(ok ? 'コピーしました' : 'コピーに失敗しました', ok ? 'success' : 'error');
  }

  return (
    <div className="p-4 max-w-app mx-auto flex flex-col gap-3">
      {posts.map((p) => (
        <div key={p.id} className="app-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="app-badge bg-amber text-white">{p.branch}</span>
            <span className="app-badge bg-ink/10 text-ink/70">{p.type}</span>
          </div>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-ink/80 mb-3">{p.body}</p>
          <button onClick={() => handleCopy(p.body)} className="app-btn-primary text-xs">
            📋 コピー
          </button>
        </div>
      ))}
    </div>
  );
}
