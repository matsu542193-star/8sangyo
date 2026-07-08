import { useEffect, useState } from 'react';
import { compressImage } from '../../../lib/imageCompress';
import { savePhoto, loadPhoto, deletePhoto, loadPhotoIndex, savePhotoIndex } from '../../../lib/idb';
import { todayStr } from '../../../lib/invoiceStore';
import { useToast } from '../../../lib/ToastContext';

export default function PhotoVault({ invoices }) {
  const [index, setIndex] = useState([]);
  const [label, setLabel] = useState('');
  const [viewerId, setViewerId] = useState(null);
  const [viewerSrc, setViewerSrc] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    loadPhotoIndex().then(setIndex);
  }, []);

  useEffect(() => {
    if (!viewerId) {
      setViewerSrc(null);
      return;
    }
    loadPhoto(viewerId).then(setViewerSrc);
  }, [viewerId]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const compressed = await compressImage(file);
    const id = crypto.randomUUID();
    await savePhoto(id, compressed);
    const entry = { id, label: label.trim() || '無題', date: todayStr(), invoiceId: null };
    const next = [entry, ...index];
    await savePhotoIndex(next);
    setIndex(next);
    setLabel('');
    showToast('写真を保存しました');
  }

  async function handleDelete(id) {
    if (!confirm('この写真を削除しますか?元に戻せません。')) return;
    await deletePhoto(id);
    const next = index.filter((p) => p.id !== id);
    await savePhotoIndex(next);
    setIndex(next);
    if (viewerId === id) setViewerId(null);
  }

  function handleDownload() {
    if (!viewerSrc) return;
    const a = document.createElement('a');
    a.href = viewerSrc;
    a.download = `photo-${viewerId}.jpg`;
    a.click();
  }

  function invoiceLabelFor(entry) {
    if (!entry.invoiceId) return null;
    const inv = invoices.find((i) => i.id === entry.invoiceId);
    return inv ? inv.number : null;
  }

  return (
    <div className="p-4 max-w-app mx-auto flex flex-col gap-3">
      <div className="app-card">
        <label className="app-label">ラベル(例:領収書、現場写真)</label>
        <input
          className="app-input mb-2"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="ラベルを入力してから写真を選択"
        />
        <input type="file" accept="image/*" capture="environment" onChange={handleUpload} className="text-xs" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {index.map((entry) => (
          <PhotoThumb key={entry.id} entry={entry} invoiceLabel={invoiceLabelFor(entry)} onOpen={() => setViewerId(entry.id)} />
        ))}
      </div>

      {index.length === 0 && <div className="text-center text-ink/40 text-sm py-8">写真はまだありません</div>}

      {viewerId && viewerSrc && (
        <div className="fixed inset-0 z-[9998] bg-black/90 flex flex-col">
          <div className="flex justify-between items-center px-4 py-3 text-white">
            <button onClick={() => setViewerId(null)} className="text-sm">
              ← 閉じる
            </button>
            <div className="flex gap-2">
              <button onClick={handleDownload} className="app-btn-secondary text-xs">
                保存
              </button>
              <button onClick={() => handleDelete(viewerId)} className="app-btn-danger text-xs">
                削除
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img src={viewerSrc} alt="" className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoThumb({ entry, invoiceLabel, onOpen }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let active = true;
    loadPhoto(entry.id).then((d) => active && setSrc(d));
    return () => {
      active = false;
    };
  }, [entry.id]);

  return (
    <button onClick={onOpen} className="app-card p-1.5 text-left">
      {src ? (
        <img src={src} alt="" className="w-full aspect-square object-cover rounded-md" />
      ) : (
        <div className="w-full aspect-square rounded-md bg-ink/5" />
      )}
      <div className="text-[10px] font-bold mt-1 truncate">{entry.label}</div>
      <div className="text-[9px] text-ink/50">{entry.date}</div>
      {invoiceLabel && <div className="text-[9px] text-amber truncate">🧾 {invoiceLabel}</div>}
    </button>
  );
}
