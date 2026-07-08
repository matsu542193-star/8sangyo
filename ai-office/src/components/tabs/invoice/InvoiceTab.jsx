import { useEffect, useState } from 'react';
import InvoiceList from './InvoiceList';
import InvoiceForm from './InvoiceForm';
import InvoiceOCR from './InvoiceOCR';
import PhotoVault from './PhotoVault';
import PrintView from './PrintView';
import { loadInvoices, saveInvoices, emptyInvoice } from '../../../lib/invoiceStore';

const SUBTABS = [
  { id: 'list', label: '一覧' },
  { id: 'create', label: '作成' },
  { id: 'ocr', label: '読取' },
  { id: 'photos', label: '写真' },
];

export default function InvoiceTab() {
  const [invoices, setInvoices] = useState(() => loadInvoices());
  const [subtab, setSubtab] = useState('list');
  const [draft, setDraft] = useState(null);
  const [printTarget, setPrintTarget] = useState(null);

  useEffect(() => {
    saveInvoices(invoices);
  }, [invoices]);

  function upsertInvoice(invoice) {
    setInvoices((prev) => {
      const exists = prev.some((inv) => inv.id === invoice.id);
      return exists ? prev.map((inv) => (inv.id === invoice.id ? invoice : inv)) : [invoice, ...prev];
    });
  }

  function deleteInvoice(id) {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  }

  function setStatus(id, status) {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)));
  }

  function openCreateNew() {
    setDraft(emptyInvoice());
    setSubtab('create');
  }

  function openEdit(invoice) {
    setDraft({ ...invoice });
    setSubtab('create');
  }

  function handleSaved(invoice) {
    upsertInvoice(invoice);
    setDraft(null);
    setSubtab('list');
  }

  function handleOcrToForm(prefilled) {
    setDraft(prefilled);
    setSubtab('create');
  }

  function handleOcrSaveDirect(invoice) {
    upsertInvoice(invoice);
    setSubtab('list');
  }

  return (
    <div>
      <div className="sticky top-[57px] z-30 bg-washi/95 backdrop-blur border-b border-ink/10">
        <div className="max-w-app mx-auto grid grid-cols-4">
          {SUBTABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSubtab(t.id);
                if (t.id === 'create' && !draft) setDraft(emptyInvoice());
              }}
              className={`py-2 text-xs font-bold ${
                subtab === t.id ? 'text-amber border-b-2 border-amber' : 'text-ink/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {subtab === 'list' && (
        <InvoiceList
          invoices={invoices}
          onCreateNew={openCreateNew}
          onEdit={openEdit}
          onDelete={deleteInvoice}
          onSetStatus={setStatus}
          onPrint={setPrintTarget}
        />
      )}
      {subtab === 'create' && draft && (
        <InvoiceForm
          key={draft.id}
          initial={draft}
          onSaved={handleSaved}
          onCancel={() => setSubtab('list')}
        />
      )}
      {subtab === 'ocr' && (
        <InvoiceOCR onSaveDirect={handleOcrSaveDirect} onEditInForm={handleOcrToForm} />
      )}
      {subtab === 'photos' && <PhotoVault invoices={invoices} />}

      {printTarget && <PrintView invoice={printTarget} onClose={() => setPrintTarget(null)} />}
    </div>
  );
}
