import { useEffect, useRef, useState } from 'react';
import { depts } from '../../data/portalData';
import { copyText } from '../../lib/clipboard';
import { useToast } from '../../lib/ToastContext';

export default function DeptTab({ openId, onOpened }) {
  const [openIds, setOpenIds] = useState(() => new Set());
  const showToast = useToast();
  const refs = useRef({});

  useEffect(() => {
    if (!openId) return;
    setOpenIds((prev) => new Set(prev).add(openId));
    requestAnimationFrame(() => {
      refs.current[openId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    onOpened?.();
  }, [openId, onOpened]);

  function toggle(id) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCopy(text) {
    const ok = await copyText(text);
    showToast(ok ? 'コピーしました' : 'コピーに失敗しました', ok ? 'success' : 'error');
  }

  return (
    <div className="p-4 max-w-app mx-auto flex flex-col gap-3">
      {depts.map((d) => {
        const isOpen = openIds.has(d.id);
        return (
          <div key={d.id} ref={(el) => (refs.current[d.id] = el)} className="app-card">
            <button
              onClick={() => toggle(d.id)}
              className="w-full flex items-center gap-2 text-left"
            >
              <span className="text-2xl">{d.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-sm">{d.name}</div>
                <div className="text-[11px] text-ink/60">{d.desc}</div>
              </div>
              <span className="text-ink/40">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
              <div className="mt-3 pt-3 border-t border-ink/10">
                <button
                  onClick={() => handleCopy(d.instruction)}
                  className="app-btn-primary mb-3 text-xs"
                >
                  📋 指示文をコピー
                </button>
                <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-ink/80 font-sans max-h-72 overflow-y-auto bg-washi rounded-lg p-3">
                  {d.instruction}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
