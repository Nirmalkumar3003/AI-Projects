import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { CommandPalette } from './components/common/CommandPalette';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { CsvImportModal } from './components/modals/CsvImportModal';
import { TransactionDetailModal } from './components/modals/TransactionDetailModal';

import { OverviewView } from './components/dashboard/OverviewView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { SavingsView } from './components/savings/SavingsView';
import { RecurringView } from './components/recurring/RecurringView';
import { ReportsView } from './components/reports/ReportsView';
import { NovaAssistantView } from './components/nova/NovaAssistantView';
import { SettingsView } from './components/settings/SettingsView';

import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Repeat,
  FileBarChart,
  Sparkles,
  Settings,
  Plus,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, setIsQuickAddOpen, isNovaOpen, setIsNovaOpen } = useFinance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user clicked "Ask NOVA" from header button, we can either switch activeTab to 'nova' or show NOVA
  React.useEffect(() => {
    if (isNovaOpen && activeTab !== 'nova') {
      setActiveTab('nova');
      setIsNovaOpen(false);
    }
  }, [isNovaOpen, activeTab, setActiveTab, setIsNovaOpen]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'transactions':
        return <TransactionsView />;
      case 'budgets':
        return <BudgetsView />;
      case 'savings':
        return <SavingsView />;
      case 'recurring':
        return <RecurringView />;
      case 'reports':
        return <ReportsView />;
      case 'nova':
        return <NovaAssistantView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] cyber-grid text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Futuristic Header */}
      <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Responsive Sidebar */}
        <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-panel border-t border-white/[0.1] px-2 py-1.5 backdrop-blur-2xl">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'overview' ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'transactions' ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 mb-0.5" />
            <span>Ledger</span>
          </button>

          {/* Center Quick Add Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center justify-center -mt-5 w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-600 text-slate-950 shadow-lg shadow-cyan-500/40 active:scale-95"
            aria-label="Add transaction"
          >
            <Plus className="w-5 h-5 font-bold" />
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'budgets' ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <PieChart className="w-4 h-4 mb-0.5" />
            <span>Budgets</span>
          </button>

          <button
            onClick={() => setActiveTab('nova')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'nova' ? 'text-violet-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5 text-violet-400 animate-pulse" />
            <span>NOVA</span>
          </button>
        </div>
      </nav>

      {/* Global Modals & Overlay Portals */}
      <CommandPalette />
      <QuickAddModal />
      <CsvImportModal />
      <TransactionDetailModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}
