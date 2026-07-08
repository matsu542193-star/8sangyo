import { hisho, hiro, orgDepts } from '../../data/portalData';

function VLine({ h = 18 }) {
  return <div className="w-px bg-ink/25 mx-auto" style={{ height: h }} />;
}

// ヒロ→秘書AIの下で6部署へ枝分かれする接続線(組織図のツリー表現)
function Branch() {
  return (
    <div className="relative w-full h-8">
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-4 bg-ink/25" />
      <div className="absolute left-[16.66%] right-[16.66%] top-4 h-px bg-ink/25" />
      <div className="absolute left-[16.66%] -translate-x-1/2 top-4 w-px h-4 bg-ink/25" />
      <div className="absolute right-[16.66%] translate-x-1/2 top-4 w-px h-4 bg-ink/25" />
    </div>
  );
}

function EmployeeBadge({ employee }) {
  return (
    <div className="app-badge bg-amber/10 text-amber mt-1.5 inline-flex items-center gap-1">
      <span>{employee.emoji}</span>
      <span>
        {employee.name}({employee.animal})
      </span>
    </div>
  );
}

export default function OrgTab({ onOpenDept }) {
  return (
    <div className="p-4 max-w-app mx-auto flex flex-col gap-6">
      <div className="flex flex-col items-center">
        <div className="app-card text-center w-full max-w-[220px] border-2 border-amber/40">
          <div className="text-3xl">{hiro.emoji}</div>
          <div className="font-bold mt-1">
            {hiro.name}({hiro.role})
          </div>
          <div className="app-badge bg-amber/10 text-amber mt-1.5">{hiro.animal}タイプ</div>
        </div>

        <VLine />

        <button
          onClick={() => onOpenDept(hisho.id)}
          className="app-card text-center w-full max-w-[260px] hover:border-amber border border-transparent transition"
        >
          <div className="text-3xl">{hisho.icon}</div>
          <div className="font-bold mt-1">{hisho.name}</div>
          <div className="text-xs text-ink/60 mt-0.5">{hisho.desc}</div>
          <EmployeeBadge employee={hisho.employee} />
        </button>

        <Branch />

        <div className="grid grid-cols-2 gap-3 w-full">
          {orgDepts.map((d) => (
            <button
              key={d.id}
              onClick={() => onOpenDept(d.id)}
              className="app-card text-center hover:border-amber border border-transparent transition relative before:content-[''] before:absolute before:-top-3 before:left-1/2 before:-translate-x-1/2 before:w-px before:h-3 before:bg-ink/25"
            >
              <div className="text-2xl">{d.icon}</div>
              <div className="font-bold text-sm mt-1">{d.name}</div>
              <div className="text-[11px] text-ink/60 mt-0.5">{d.desc}</div>
              <EmployeeBadge employee={d.employee} />
            </button>
          ))}
        </div>
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
