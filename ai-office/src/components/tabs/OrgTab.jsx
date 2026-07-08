import { hisho, orgDepts } from '../../data/portalData';

export default function OrgTab({ onOpenDept }) {
  return (
    <div className="p-4 max-w-app mx-auto flex flex-col gap-4">
      <div className="app-card text-center">
        <div className="text-3xl">👤</div>
        <div className="font-bold mt-1">ヒロ(代表)</div>
      </div>
      <div className="text-center text-ink/40">↓</div>
      <button
        onClick={() => onOpenDept(hisho.id)}
        className="app-card text-center hover:border-amber border border-transparent"
      >
        <div className="text-3xl">{hisho.icon}</div>
        <div className="font-bold mt-1">{hisho.name}</div>
        <div className="text-xs text-ink/60 mt-0.5">{hisho.desc}</div>
      </button>
      <div className="text-center text-ink/40">↓</div>

      <div className="grid grid-cols-2 gap-3">
        {orgDepts.map((d) => (
          <button
            key={d.id}
            onClick={() => onOpenDept(d.id)}
            className="app-card text-center hover:border-amber border border-transparent"
          >
            <div className="text-2xl">{d.icon}</div>
            <div className="font-bold text-sm mt-1">{d.name}</div>
            <div className="text-[11px] text-ink/60 mt-0.5">{d.desc}</div>
          </button>
        ))}
      </div>

      <div className="app-card">
        <div className="font-bold text-sm mb-2">🔁 売上の循環</div>
        <div className="text-xs text-ink/70 leading-relaxed">
          現場写真 → SNS → 問い合わせ → 事務 → 現場
        </div>
      </div>

      <div className="app-card">
        <div className="font-bold text-sm mb-2">🏛 売上4本柱</div>
        <ul className="text-xs text-ink/70 leading-relaxed list-disc list-inside">
          <li>①駆除100万</li>
          <li>②MEO/AI代行60万</li>
          <li>③スクール・note25万</li>
          <li>④コンサル15万</li>
        </ul>
      </div>
    </div>
  );
}
