import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ActiveTab, Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  Search,
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Repeat,
  FileBarChart,
  Sparkles,
  Settings,
  Plus,
  Upload,
  Download,
  Sun,
  Moon,
  Database,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { exportToCSV } from '../../utils/calculations';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveTab,
    setIsQuickAddOpen,
    setIsNovaOpen,
    setIsCsvImportOpen,
    transactions,
    categories,
    settings,
    updateSettings,
    loadDemoData,
    setInspectingTransaction,
    addToast,
  } = useFinance();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Command items
  const staticCommands = useMemo(() => {
    return [
      {
        id: 'nav-overview',
        title: 'Go to Command Center',
        subtitle: 'Dashboard overview and real-time telemetry',
        icon: LayoutDashboard,
        category: 'Navigation',
        action: () => setActiveTab('overview'),
      },
      {
        id: 'nav-tx',
        title: 'View Transactions Ledger',
        subtitle: 'Audit, search, and manage historical transactions',
        icon: ArrowLeftRight,
        category: 'Navigation',
        action: () => setActiveTab('transactions'),
      },
      {
        id: 'nav-budgets',
        title: 'Inspect Smart Budgets',
        subtitle: 'Category-level limits and what-if simulation',
        icon: PieChart,
        category: 'Navigation',
        action: () => setActiveTab('budgets'),
      },
      {
        id: 'nav-savings',
        title: 'Explore Savings Vaults',
        subtitle: 'Emergency funds, hardware rigs, and milestone goals',
        icon: Target,
        category: 'Navigation',
        action: () => setActiveTab('savings'),
      },
      {
        id: 'nav-recurring',
        title: 'Manage Recurring & Subscriptions',
        subtitle: 'Monthly obligations, mandates, and burn rate',
        icon: Repeat,
        category: 'Navigation',
        action: () => setActiveTab('recurring'),
      },
      {
        id: 'nav-reports',
        title: 'Analytics & Financial Reports',
        subtitle: 'Statements, cash flow trajectory, and breakdowns',
        icon: FileBarChart,
        category: 'Navigation',
        action: () => setActiveTab('reports'),
      },
      {
        id: 'action-quick-add',
        title: 'Record New Expense / Income',
        subtitle: 'Fast transaction logger with shortcuts',
        icon: Plus,
        category: 'Actions',
        action: () => setIsQuickAddOpen(true),
      },
      {
        id: 'action-nova',
        title: 'Engage NOVA AI Intelligence',
        subtitle: 'Conversational analysis and predictive inquiries',
        icon: Sparkles,
        category: 'Actions',
        action: () => setIsNovaOpen(true),
      },
      {
        id: 'action-csv-import',
        title: 'Import Transactions from CSV',
        subtitle: 'Upload and reconcile external bank statements',
        icon: Upload,
        category: 'Data Management',
        action: () => setIsCsvImportOpen(true),
      },
      {
        id: 'action-csv-export',
        title: 'Export Entire Ledger to CSV',
        subtitle: 'Download complete transaction history',
        icon: Download,
        category: 'Data Management',
        action: () => {
          const csvData = exportToCSV(transactions, categories);
          const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `nexora-ledger-${new Date().toISOString().substring(0, 10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          addToast({ type: 'success', title: 'Export Complete', message: 'CSV downloaded successfully.' });
        },
      },
      {
        id: 'action-theme',
        title: `Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        subtitle: 'Toggle interface illumination theme',
        icon: settings.theme === 'dark' ? Sun : Moon,
        category: 'Preferences',
        action: () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' }),
      },
      {
        id: 'action-demo-data',
        title: 'Load Realistic Indian Rupee Demo Data',
        subtitle: 'Re-populate dashboard with believable transactions',
        icon: Database,
        category: 'Data Management',
        action: () => loadDemoData(),
      },
    ];
  }, [
    setActiveTab,
    setIsQuickAddOpen,
    setIsNovaOpen,
    setIsCsvImportOpen,
    transactions,
    categories,
    settings.theme,
    updateSettings,
    loadDemoData,
    addToast,
  ]);

  // Filter commands and matching transactions based on search query
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return staticCommands;

    const matchedCommands = staticCommands.filter(
      (c) => c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );

    // Also match transactions
    const matchedTransactions = transactions
      .filter((t) => t.title.toLowerCase().includes(q) || (t.merchant && t.merchant.toLowerCase().includes(q)))
      .slice(0, 5)
      .map((t) => ({
        id: `tx-${t.id}`,
        title: t.title,
        subtitle: `${t.date} • ${formatCurrency(t.amount, settings.currency)} • ${t.paymentMethod}`,
        icon: CreditCard,
        category: 'Transactions Found',
        action: () => setInspectingTransaction(t),
      }));

    return [...matchedCommands, ...matchedTransactions];
  }, [query, staticCommands, transactions, settings.currency, setInspectingTransaction]);

  // Keyboard navigation inside palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) return;

      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredItems.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          setIsCommandPaletteOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, filteredItems, selectedIndex, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.1] bg-slate-900/40">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search transactions..."
            className="w-full bg-transparent border-0 text-white placeholder-slate-400 focus:outline-none text-base font-medium"
          />
          <kbd className="px-2 py-0.5 text-xs font-mono bg-white/[0.08] text-slate-400 rounded border border-white/[0.1]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No matching commands or transactions found for &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setIsCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/40 text-white shadow-lg shadow-cyan-950/30'
                      : 'text-slate-300 hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold truncate leading-tight">{item.title}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/[0.08]">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded mr-1">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded mr-1">↵</kbd> Select
            </span>
          </div>
          <span>NEXORA Neural Command System</span>
        </div>
      </div>
    </div>
  );
};
