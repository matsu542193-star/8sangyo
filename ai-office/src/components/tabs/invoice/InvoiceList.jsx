import { useEffect, useState } from 'react';
import { formatYen, statusLabel } from '../../../lib/invoiceStore';
import { loadPhoto } from '../../../lib/idb';
import { salesGoal } from '../../../data/portalData';

const STATUS_STYLE = {
  draft: 'bg-ink/10 text-ink/70',
  sent: 'bg-amber/15 text-amber',
  paid: 'bg-success/15 text-success',
};

function InvoiceThumb({ photoId }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let active = true;
    if (photoId) loadPhoto(photoId).then((d) => active && setSrc(d));
    return () => {
      active = false;
    };
  }, [photoId]);
  if (!src) return null;
  return <img src={src} alt="原本" className="w-12 h-12 object-cover rounded-md border border-ink/10" />;
}

export default function InvoiceList({ invoices, onCreateNew, onEdit, onDelete, onSetStatus, onPrint }) {
  const isThisMonth = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };

  const paidThisMonth = invoices
    .filter((inv) => inv.status === 'paid' && isThisMonth(inv.issueDate))
    .reduce((sum, inv) => sum + inv.total, 0);

  const unpaidTotal = invoices
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const progress = Math.min(100, Math.round((paidThisMonth / salesGoal) * 100));

  return (
    <div className="p-4 max-w-app mx-auto flex flex-col gap-3">
      <div className="app-card">
        <div className="text-xs text-ink/60 mb-1">今月の入金済み売上</div>
        <div className="text-2xl font-bold text-ink mb-2">{formatYen(paidThisMonth)}</div>
        <div className="h-2 rounded-full bg-ink/10 overflow-hidden mb-1">
          <div className="h-full bg-amber transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-[11px] text-ink/50 mb-3">
          200万目標への進捗 {progress}%
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-ink/60">未入金合計</span>
          <span className="font-bold text-warn">{formatYen(unpaidTotal)}</span>
        </div>
      </div>

      <button onClick={onCreateNew} className="app-btn-primary w-full">
        + 新規請求書を作成
      </button>

      {invoices.length === 0 && (
        <div className="text-center text-ink/40 text-sm py-8">請求書はまだありません</div>
      )}

      {invoices.map((inv) => (
        <div key={inv.id} className="app-card">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div>
              <div className="font-bold text-sm">
                {inv.customer || '(宛名未入力)'}
                {inv.honorific}
              </div>
              <div className="text-[11px] text-ink/50">
                {inv.number} ・ {inv.issueDate}
              </div>
            </div>
            <span className={`app-badge shrink-0 ${STATUS_STYLE[inv.status]}`}>
              {statusLabel(inv.status)}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            {inv.photoId && <InvoiceThumb photoId={inv.photoId} />}
            <div className="text-xl font-bold text-ink">{formatYen(inv.total)}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => onPrint(inv)} className="app-btn-secondary text-xs">
              🖨 印刷/PDF
            </button>
            <button onClick={() => onEdit(inv)} className="app-btn-secondary text-xs">
              ✏️ 編集
            </button>
            <select
              value={inv.status}
              onChange={(e) => onSetStatus(inv.id, e.target.value)}
              className="app-input text-xs w-auto py-1"
            >
              <option value="draft">未請求</option>
              <option value="sent">請求済</option>
              <option value="paid">入金済</option>
            </select>
            <button
              onClick={() => {
                if (confirm('この請求書を削除しますか?元に戻せません。')) onDelete(inv.id);
              }}
              className="app-btn-danger text-xs"
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
