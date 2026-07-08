import { useMemo, useState } from 'react';
import { calcTotals, presetItems, addDays } from '../../../lib/invoiceStore';
import { useToast } from '../../../lib/ToastContext';

export default function InvoiceForm({ initial, onSaved, onCancel }) {
  const [inv, setInv] = useState(initial);
  const showToast = useToast();

  const totals = useMemo(() => calcTotals(inv.items), [inv.items]);

  function set(field, value) {
    setInv((prev) => ({ ...prev, [field]: value }));
  }

  function setIssueDate(value) {
    setInv((prev) => ({ ...prev, issueDate: value, dueDate: addDays(value, 30) }));
  }

  function updateItem(idx, field, value) {
    setInv((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
  }

  function addItem(preset) {
    const newItem = { name: preset?.name || '', qty: 1, price: preset?.price || 0 };
    setInv((prev) => {
      const onlyBlankRow =
        prev.items.length === 1 && !prev.items[0].name && !prev.items[0].price;
      return {
        ...prev,
        items: onlyBlankRow ? [newItem] : [...prev.items, newItem],
      };
    });
  }

  function removeItem(idx) {
    setInv((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!inv.customer.trim()) {
      showToast('宛名を入力してください', 'error');
      return;
    }
    const totalsNow = calcTotals(inv.items);
    onSaved({ ...inv, ...totalsNow });
    showToast('保存しました');
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-app mx-auto flex flex-col gap-3">
      <div className="app-card flex flex-col gap-3">
        <div>
          <label className="app-label">宛名</label>
          <div className="flex gap-2">
            <input
              className="app-input"
              value={inv.customer}
              onChange={(e) => set('customer', e.target.value)}
              placeholder="山田 太郎"
            />
            <select
              className="app-input w-24"
              value={inv.honorific}
              onChange={(e) => set('honorific', e.target.value)}
            >
              <option value="様">様</option>
              <option value="御中">御中</option>
            </select>
          </div>
        </div>

        <div>
          <label className="app-label">施工場所</label>
          <input
            className="app-input"
            value={inv.site}
            onChange={(e) => set('site', e.target.value)}
            placeholder="埼玉県飯能市○○"
          />
        </div>

        <div>
          <label className="app-label">請求先住所</label>
          <input
            className="app-input"
            value={inv.billingAddress}
            onChange={(e) => set('billingAddress', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="app-label">発行日</label>
            <input
              type="date"
              className="app-input"
              value={inv.issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>
          <div>
            <label className="app-label">支払期限</label>
            <input
              type="date"
              className="app-input"
              value={inv.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="app-label">自由メモ</label>
          <textarea
            className="app-input"
            rows={2}
            value={inv.freeNote}
            onChange={(e) => set('freeNote', e.target.value)}
          />
        </div>
      </div>

      <div className="app-card">
        <label className="app-label">プリセット(タップで行追加)</label>
        <div className="flex flex-wrap gap-2">
          {presetItems.map((p) => (
            <button
              type="button"
              key={p.name}
              onClick={() => addItem(p)}
              className="app-btn-secondary text-[11px] py-1 px-2"
            >
              {p.name} {p.price.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <div className="app-card">
        <label className="app-label">明細</label>
        <div className="flex flex-col gap-2">
          {inv.items.map((it, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                className="app-input flex-1"
                placeholder="内容"
                value={it.name}
                onChange={(e) => updateItem(idx, 'name', e.target.value)}
              />
              <input
                type="number"
                className="app-input w-16"
                min={0}
                value={it.qty}
                onChange={(e) => updateItem(idx, 'qty', Number(e.target.value))}
              />
              <input
                type="number"
                className="app-input w-24"
                min={0}
                value={it.price}
                onChange={(e) => updateItem(idx, 'price', Number(e.target.value))}
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-warn text-lg leading-none px-1"
                aria-label="行を削除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addItem()} className="app-btn-secondary text-xs mt-2">
          + 行を追加
        </button>
      </div>

      <div className="app-card text-sm">
        <div className="flex justify-between py-1">
          <span className="text-ink/60">小計</span>
          <span>¥{totals.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-ink/60">消費税(10%)</span>
          <span>¥{totals.tax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between py-1 font-bold text-base border-t border-ink/10 mt-1 pt-2">
          <span>合計</span>
          <span>¥{totals.total.toLocaleString()}</span>
        </div>
      </div>

      <div className="app-card">
        <label className="app-label">備考</label>
        <textarea
          className="app-input"
          rows={3}
          value={inv.note}
          onChange={(e) => set('note', e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="app-btn-secondary flex-1">
          キャンセル
        </button>
        <button type="submit" className="app-btn-primary flex-1">
          保存
        </button>
      </div>
    </form>
  );
}
