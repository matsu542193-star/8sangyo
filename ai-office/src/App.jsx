import { useState } from 'react';
import PasswordGate from './components/PasswordGate';
import Header from './components/Header';
import TabBar from './components/TabBar';
import OrgTab from './components/tabs/OrgTab';
import DeptTab from './components/tabs/DeptTab';
import WeeklyTab from './components/tabs/WeeklyTab';
import PostsTab from './components/tabs/PostsTab';
import InvoiceTab from './components/tabs/invoice/InvoiceTab';
import { ToastProvider } from './lib/ToastContext';

function AppContent() {
  const [tab, setTab] = useState('org');
  const [pendingDeptId, setPendingDeptId] = useState(null);

  function openDept(id) {
    setPendingDeptId(id);
    setTab('dept');
  }

  return (
    <div className="min-h-screen flex flex-col bg-washi">
      <Header />
      <TabBar active={tab} onChange={setTab} />
      <main className="flex-1 pb-8">
        {tab === 'org' && <OrgTab onOpenDept={openDept} />}
        {tab === 'dept' && (
          <DeptTab openId={pendingDeptId} onOpened={() => setPendingDeptId(null)} />
        )}
        {tab === 'weekly' && <WeeklyTab />}
        {tab === 'posts' && <PostsTab />}
        {tab === 'invoice' && <InvoiceTab />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <PasswordGate>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </PasswordGate>
  );
}
