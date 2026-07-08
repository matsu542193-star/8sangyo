import { loadJSON, saveJSON } from './storage';

const INVOICES_KEY = 'invoices';
const SEQ_KEY = 'invoice_seq';

export function loadInvoices() {
  return loadJSON(INVOICES_KEY, []);
}

export function saveInvoices(invoices) {
  saveJSON(INVOICES_KEY, invoices);
}

export function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  const seqMap = loadJSON(SEQ_KEY, {});
  const next = (seqMap[year] || 0) + 1;
  seqMap[year] = next;
  saveJSON(SEQ_KEY, seqMap);
  return `8S-${year}-${String(next).padStart(4, '0')}`;
}

export function calcTotals(items) {
  const subtotal = items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  const tax = Math.floor(subtotal * 0.1);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

export function statusLabel(status) {
  return { draft: '未請求', sent: '請求済', paid: '入金済' }[status] || status;
}

export function formatYen(n) {
  return `¥${Number(n || 0).toLocaleString('ja-JP')}`;
}

export const presetItems = [
  { name: '蜂の巣駆除(スズメバチ)', price: 25000 },
  { name: '蜂の巣駆除(アシナガバチ)', price: 15000 },
  { name: '蜂の巣駆除(ミツバチ)', price: 20000 },
  { name: '再発防止処理・消毒', price: 5000 },
  { name: '高所作業費', price: 8000 },
  { name: '外壁洗浄', price: 30000 },
  { name: 'ごみ屋敷対応', price: 80000 },
  { name: '残置物撤去', price: 50000 },
  { name: '空き家管理(月額)', price: 10000 },
  { name: 'MEO運用代行(月額)', price: 40000 },
];

export const defaultNote =
  '作業当日の追加料金は一切ありません。\n駆除後の再発時は保証対応いたします(3ヶ月)。';

export function addDays(dateStr, days) {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function emptyInvoice() {
  return {
    id: crypto.randomUUID(),
    number: nextInvoiceNumber(),
    customer: '',
    honorific: '様',
    site: '',
    billingAddress: '',
    issueDate: todayStr(),
    dueDate: addDays(todayStr(), 30),
    items: [{ name: '', qty: 1, price: 0 }],
    note: defaultNote,
    freeNote: '',
    status: 'draft',
    photoId: null,
  };
}
