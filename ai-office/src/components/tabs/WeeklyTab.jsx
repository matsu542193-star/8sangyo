import { useState } from 'react';
import { routine, weekDays } from '../../data/portalData';
import { loadJSON, saveJSON } from '../../lib/storage';

const CHECK_KEY = 'weekly_checks';

export default function WeeklyTab() {
  const [checks, setChecks] = useState(() => loadJSON(CHECK_KEY, {}));

  function toggle(id) {
    setChecks((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveJSON(CHECK_KEY, next);
      return next;
    });
  }

  function resetWeek() {
    if (!confirm('今週のチェックをすべてリセットしますか?')) return;
    setChecks({});
    saveJSON(CHECK_KEY, {});
  }

  const allIds = weekDays.flatMap((day) => routine[day].map((item) => item.id));
  const doneCount = allIds.filter((id) => checks[id]).length;
  const progress = allIds.length ? Math.round((doneCount / allIds.length) * 100) : 0;

  return (
    <div className="p-4 max-w-app mx-auto flex flex-col gap-3">
      <div className="app-card">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-sm">週間進捗</span>
          <span className="text-xs text-ink/60">
            {doneCount}/{allIds.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-ink/10 overflow-hidden">
          <div className="h-full bg-amber transition-all" style={{ width: `${progress}%` }} />
        </div>
        <button onClick={resetWeek} className="app-btn-secondary text-xs mt-3 w-full">
          週明けリセット
        </button>
      </div>

      {weekDays.map((day) => (
        <div key={day} className="app-card">
          <div className="font-bold text-sm mb-2">{day}曜日</div>
          <div className="flex flex-col gap-2">
            {routine[day].map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="mt-1 accent-amber w-4 h-4 shrink-0"
                  checked={!!checks[item.id]}
                  onChange={() => toggle(item.id)}
                />
                <span className={checks[item.id] ? 'line-through text-ink/40' : ''}>
                  <span className="app-badge bg-amber/10 text-amber mr-1">{item.dept}</span>
                  {item.task}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
