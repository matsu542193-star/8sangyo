const TABS = [
  { id: 'org', icon: '🏢', label: '組織' },
  { id: 'dept', icon: '📚', label: '部署' },
  { id: 'weekly', icon: '📅', label: '週間' },
  { id: 'posts', icon: '📣', label: '投稿' },
  { id: 'invoice', icon: '🧾', label: '請求' },
];

export default function TabBar({ active, onChange }) {
  return (
    <nav className="sticky top-0 z-40 bg-washi/95 backdrop-blur border-b border-ink/10">
      <div className="max-w-app mx-auto grid grid-cols-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition ${
              active === t.id ? 'text-amber border-b-2 border-amber' : 'text-ink/50 border-b-2 border-transparent'
            }`}
          >
            <span className="text-lg leading-none">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export { TABS };
