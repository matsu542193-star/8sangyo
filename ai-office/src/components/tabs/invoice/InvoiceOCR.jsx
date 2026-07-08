import { useState } from 'react';
import { ocrInvoiceImage } from '../../../lib/ocr';
import { compressImage } from '../../../lib/imageCompress';
import { savePhoto, loadPhotoIndex, savePhotoIndex } from '../../../lib/idb';
import { calcTotals, emptyInvoice, formatYen, addDays, todayStr } from '../../../lib/invoiceStore';
import { useToast } from '../../../lib/ToastContext';

export default function InvoiceOCR({ onSaveDirect, onEditInForm }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [attachPhoto, setAttachPhoto] = useState(true);
  const showToast = useToast();

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError('');
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  }

  async function handleRead() {
    if (!preview) return;
    setLoading(true);
    setError('');
    try {
      const parsed = await ocrInvoiceImage(preview);
      setResult(parsed);
    } catch (e) {
      setError(e.message || '読み取りに失敗しました。もう一度撮影してお試しください。');
    } finally {
      setLoading(false);
    }
  }

  function buildInvoiceFromResult() {
    const items = (result.items || []).map((it) => ({
      name: it.name || '',
      qty: Number(it.qty) || 1,
      price: Number(it.price) || 0,
    }));
    const totals = calcTotals(items.length ? items : [{ name: '', qty: 1, price: 0 }]);
    const base = emptyInvoice();
    return {
      ...base,
      customer: result.customer || '',
      honorific: result.honorific || '様',
      site: result.site || '',
      billingAddress: result.billingAddress || '',
      issueDate: result.issueDate || todayStr(),
      dueDate: result.dueDate || addDays(result.issueDate || todayStr(), 30),
      items: items.length ? items : base.items,
      note: result.note || base.note,
      ...totals,
    };
  }

  async function attachPhotoIfNeeded(invoiceId) {
    if (!attachPhoto || !file) return null;
    const compressed = await compressImage(file);
    const photoId = crypto.randomUUID();
    await savePhoto(photoId, compressed);
    const index = await loadPhotoIndex();
    index.unshift({
      id: photoId,
      label: '請求書原本',
      date: todayStr(),
      invoiceId,
    });
    await savePhotoIndex(index);
    return photoId;
  }

  async function handleSaveDirect() {
    const invoice = buildInvoiceFromResult();
    const photoId = await attachPhotoIfNeeded(invoice.id);
    onSaveDirect({ ...invoice, photoId });
    reset();
    showToast('保存しました');
  }

  async function handleEditInForm() {
    const invoice = buildInvoiceFromResult();
    const photoId = await attachPhotoIfNeeded(invoice.id);
    onEditInForm({ ...invoice, photoId });
    reset();
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
  }

  const totals = result ? calcTotals(result.items || []) : null;
  const mismatch =
    result && result.totalOnDoc && totals && Number(result.totalOnDoc) !== totals.total;

  return (
    <div className="p-4 max-w-app mx-auto flex flex-col gap-3">
      <div className="app-card">
        <label className="app-label">請求書・見積書の写真</label>
        <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="text-xs" />
        {preview && (
          <img src={preview} alt="プレビュー" className="mt-3 w-full max-h-64 object-contain rounded-lg border border-ink/10" />
        )}
        {preview && !result && (
          <button onClick={handleRead} disabled={loading} className="app-btn-primary w-full mt-3">
            {loading ? '読み取り中…' : '🤖 AIで読み取る'}
          </button>
        )}
        {error && <p className="text-warn text-xs mt-2">{error}</p>}
      </div>

      {result && (
        <>
          <div className="app-card">
            <div className="font-bold text-sm mb-2">読み取り結果</div>
            {mismatch && (
              <div className="bg-warn/10 text-warn text-xs rounded-lg p-2 mb-3">
                ⚠️ 書面の合計({formatYen(result.totalOnDoc)})と自動計算({formatYen(totals.total)})が一致しません。内容をご確認ください。
              </div>
            )}
            <dl className="text-sm space-y-1">
              <div className="flex justify-between">
                <dt className="text-ink/60">宛名</dt>
                <dd>
                  {result.customer}
                  {result.honorific}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">施工場所</dt>
                <dd>{result.site}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">発行日</dt>
                <dd>{result.issueDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">支払期限</dt>
                <dd>{result.dueDate}</dd>
              </div>
            </dl>
            <div className="mt-3 border-t border-ink/10 pt-2">
              {(result.items || []).map((it, idx) => (
                <div key={idx} className="flex justify-between text-xs py-0.5">
                  <span>
                    {it.name} ×{it.qty}
                  </span>
                  <span>{formatYen(it.price)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-sm mt-2 border-t border-ink/10 pt-2">
              <span>自動計算合計</span>
              <span>{formatYen(totals.total)}</span>
            </div>
          </div>

          <label className="app-card flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="accent-amber w-4 h-4"
              checked={attachPhoto}
              onChange={(e) => setAttachPhoto(e.target.checked)}
            />
            原本写真も紐付けて保存
          </label>

          <div className="flex gap-2">
            <button onClick={handleEditInForm} className="app-btn-secondary flex-1">
              編集してから保存
            </button>
            <button onClick={handleSaveDirect} className="app-btn-primary flex-1">
              このまま保存
            </button>
          </div>
        </>
      )}
    </div>
  );
}
