import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SUPPORTED_CURRENCIES, formatCurrency } from '../../utils/formatters';
import {
  Settings,
  User,
  Coins,
  Sun,
  Moon,
  Shield,
  Download,
  RotateCcw,
  Trash2,
  Check,
  Sparkles,
  Database,
  Lock,
  Globe,
  Bell,
  Cpu,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    transactions,
    categories,
    budgets,
    savingsGoals,
    recurring,
    loadDemoData,
    clearAllData,
    addToast,
  } = useFinance();

  const [userName, setUserName] = useState(settings.userName);
  const [userTitle, setUserTitle] = useState(settings.userTitle);
  const [startingBalance, setStartingBalance] = useState(settings.startingBalance.toString());
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(settings.currency.code);
  const [theme, setTheme] = useState(settings.theme);
  const [lowBalanceWarning, setLowBalanceWarning] = useState(settings.lowBalanceWarning.toString());
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState(settings.budgetAlertThreshold.toString());

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const curr = SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrencyCode) || settings.currency;
    const startBal = parseFloat(startingBalance) || 0;
    const lowBal = parseFloat(lowBalanceWarning) || 20000;
    const alertThresh = parseInt(budgetAlertThreshold) || 80;

    updateSettings({
      userName: userName.trim() || 'Commander',
      userTitle: userTitle.trim() || 'FinTech Architect',
      startingBalance: startBal,
      currency: curr,
      theme,
      lowBalanceWarning: lowBal,
      budgetAlertThreshold: alertThresh,
    });
  };

  const handleExportJSON = () => {
    const backup = {
      version: 'nexora-v2.0',
      exportedAt: new Date().toISOString(),
      settings,
      transactions,
      categories,
      budgets,
      savingsGoals,
      recurring,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora-backup-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'Full Backup Exported',
      message: 'All ledger collections and configurations serialized to JSON.',
    });
  };

  const handleConfirmReset = () => {
    if (confirm('Load realistic Indian Rupee sample dataset? Current uncommitted changes will be replaced.')) {
      loadDemoData();
    }
  };

  const handleConfirmPurge = () => {
    if (confirm('WARNING: Are you sure you want to purge all records and initialize a completely empty ledger? This action cannot be reversed.')) {
      clearAllData();
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
            SYSTEM PARAMETERS
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            NEXORA Core Config
          </span>
        </div>
        <h2 className="text-2xl font-bold font-display text-white mt-1">
          Settings & Preferences
        </h2>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* User Profile & Identity */}
        <div className="p-6 rounded-2xl glass-card border border-white/[0.08] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Profile Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-mono mb-1">COMMANDER NAME</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">TITLE / DESIGNATION</label>
              <input
                type="text"
                value={userTitle}
                onChange={(e) => setUserTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Initialization */}
        <div className="p-6 rounded-2xl glass-card border border-white/[0.08] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>Currency & Opening Balance</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-mono mb-1">
                PRIMARY OPERATING CURRENCY
              </label>
              <select
                value={selectedCurrencyCode}
                onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white text-sm font-mono"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} — {c.name} ({c.locale})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Default: Indian Rupee (₹ INR) with precision-safe formatting.
              </p>
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">
                STARTING / OPENING ACCOUNT BALANCE
              </label>
              <input
                type="number"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white font-mono-numbers text-sm font-semibold"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Distinguishes initial capital reserves from current monthly net cash flow.
              </p>
            </div>
          </div>
        </div>

        {/* Interface Theme & Alerts */}
        <div className="p-6 rounded-2xl glass-card border border-white/[0.08] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Appearance & Risk Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-mono mb-1">THEME ILLUMINATION</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white text-sm"
              >
                <option value="dark">Cyber Dark (Obsidian & Cyan)</option>
                <option value="light">Clean Light</option>
                <option value="system">System Synchronized</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">
                BUDGET ALERT THRESHOLD (%)
              </label>
              <input
                type="number"
                value={budgetAlertThreshold}
                onChange={(e) => setBudgetAlertThreshold(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white text-sm font-mono-numbers"
              />
              <p className="text-[11px] text-slate-500 mt-1">Warns when category hits this utilization</p>
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">
                MINIMUM LIQUIDITY BUFFER
              </label>
              <input
                type="number"
                value={lowBalanceWarning}
                onChange={(e) => setLowBalanceWarning(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white text-sm font-mono-numbers"
              />
              <p className="text-[11px] text-slate-500 mt-1">Alerts if balance dips below this level</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </form>

      {/* AI Telemetry Engine Status */}
      <div className="p-6 rounded-2xl glass-card border border-white/[0.08] space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-violet-400" />
          <span>NOVA AI Subsystem</span>
        </h3>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <p className="text-white font-semibold">Gemini 3.8 Flash Neural Core</p>
            <p className="text-slate-400 text-[11px]">
              Server-side GenAI SDK integration with telemetry proxy.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full font-mono text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
            ONLINE
          </span>
        </div>
      </div>

      {/* Data Management & Disaster Recovery */}
      <div className="p-6 rounded-2xl glass-card border border-white/[0.08] space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Data Lifecycle & Workspace Recovery</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-left transition-colors group"
          >
            <Download className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-white">Export Full JSON</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Download immutable JSON backup of all ledger transactions and budgets.
            </p>
          </button>

          <button
            onClick={handleConfirmReset}
            className="p-4 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-left transition-colors group"
          >
            <RotateCcw className="w-5 h-5 text-amber-400 mb-2 group-hover:rotate-45 transition-transform" />
            <h4 className="text-xs font-bold text-amber-300">Restore Indian Rupee Demo</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Reset ledger to realistic sample transactions, goals, and monthly budgets.
            </p>
          </button>

          <button
            onClick={handleConfirmPurge}
            className="p-4 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-left transition-colors group"
          >
            <Trash2 className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-rose-300">Purge Workspace</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Wipe all recorded transactions and reset ledger to zero for fresh workspace.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
