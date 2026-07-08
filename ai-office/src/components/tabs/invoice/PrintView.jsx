import { formatYen } from '../../../lib/invoiceStore';

export default function PrintView({ invoice, onClose }) {
  const inv = invoice;

  return (
    <div className="fixed inset-0 z-[9998] bg-white overflow-y-auto">
      <div className="sticky top-0 z-10 flex justify-between items-center px-4 py-2 bg-ink text-white print:hidden">
        <button onClick={onClose} className="text-sm">
          ← 閉じる
        </button>
        <button onClick={() => window.print()} className="app-btn-primary text-xs">
          🖨 印刷/PDF保存
        </button>
      </div>

      <div id="invoice-print-view" className="max-w-[640px] mx-auto p-8 font-mincho text-ink">
        <div className="text-center mb-8">
          <div className="border-t-2 border-b-2 border-ink py-2 text-2xl font-bold tracking-[0.5em] inline-block px-6">
            御 請 求 書
          </div>
        </div>

        <div className="flex justify-between mb-6 text-sm">
          <div>
            <div className="text-lg font-bold border-b border-ink inline-block pb-1 mb-1">
              {inv.customer} {inv.honorific}
            </div>
            <div className="text-xs text-ink/70">{inv.billingAddress}</div>
          </div>
          <div className="text-right text-xs">
            <div>請求書番号:{inv.number}</div>
            <div>発行日:{inv.issueDate}</div>
            <div>支払期限:{inv.dueDate}</div>
          </div>
        </div>

        <div className="text-sm mb-2">施工場所:{inv.site}</div>

        <div className="border-2 border-ink px-4 py-3 mb-6 flex justify-between items-center">
          <span className="font-bold">ご請求金額</span>
          <span className="text-2xl font-bold">{formatYen(inv.total)}</span>
        </div>

        <table className="w-full text-sm mb-6 border-collapse">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="text-left py-1">内容</th>
              <th className="text-right py-1 w-14">数量</th>
              <th className="text-right py-1 w-24">単価</th>
              <th className="text-right py-1 w-24">金額</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it, idx) => (
              <tr key={idx} className="border-b border-ink/30">
                <td className="py-1">{it.name}</td>
                <td className="text-right py-1">{it.qty}</td>
                <td className="text-right py-1">{formatYen(it.price)}</td>
                <td className="text-right py-1">{formatYen(it.qty * it.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-48 text-sm">
            <div className="flex justify-between py-1">
              <span>小計</span>
              <span>{formatYen(inv.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>消費税(10%)</span>
              <span>{formatYen(inv.tax)}</span>
            </div>
            <div className="flex justify-between py-1 font-bold border-t border-ink mt-1 pt-1">
              <span>合計</span>
              <span>{formatYen(inv.total)}</span>
            </div>
          </div>
        </div>

        {(inv.note || inv.freeNote) && (
          <div className="border border-ink/40 rounded p-3 text-xs mb-8 whitespace-pre-wrap">
            {inv.note}
            {inv.freeNote ? `\n${inv.freeNote}` : ''}
          </div>
        )}

        <div className="text-xs text-center text-ink/70 leading-relaxed">
          蜂の巣駆除産業 / 代表:松木裕和
          <br />
          埼玉県飯能市 / TEL:070-2670-6907
          <br />
          https://8sangyo.com/
        </div>
      </div>
    </div>
  );
}
