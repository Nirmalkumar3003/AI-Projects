import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/calculations';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart as PieIcon,
  CreditCard,
  Building,
  TrendingUp,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    transactions,
    categories,
    budgets,
    categorySpendBreakdown,
    totalBalance,
    currentMonthIncome,
    currentMonthExpenses,
    savingsRate,
    settings,
    addToast,
  } = useFinance();

  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-10');

  // Filter transactions for report period
  const periodTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedPeriod));
  }, [transactions, selectedPeriod]);

  const periodIncome = useMemo(() => {
    return periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [periodTransactions]);

  const periodExpense = useMemo(() => {
    return periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [periodTransactions]);

  const periodNet = periodIncome - periodExpense;
  const periodSavingsRate = periodIncome > 0
    ? Math.max(0, Math.round((periodNet / periodIncome) * 100))
    : 0;

  // Merchant spending breakdown
  const topMerchants = useMemo(() => {
    const map = new Map<string, number>();
    periodTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const m = t.merchant || 'General / Unnamed Payee';
        map.set(m, (map.get(m) || 0) + t.amount);
      });

    return Array.from(map.entries())
      .map(([name, total]) => ({
        name,
        total,
        percentage: periodExpense > 0 ? Math.round((total / periodExpense) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [periodTransactions, periodExpense]);

  // Payment method breakdown
  const paymentMethodBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    periodTransactions.forEach((t) => {
      const pm = t.paymentMethod || 'Other';
      map.set(pm, (map.get(pm) || 0) + t.amount);
    });

    const total = Array.from(map.values()).reduce((sum, v) => sum + v, 0);

    return Array.from(map.entries())
      .map(([method, amount]) => ({
        method,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [periodTransactions]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const csvData = exportToCSV(periodTransactions, categories);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora-statement-${selectedPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'Report Downloaded',
      message: `Exported statement for ${selectedPeriod}.`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 print:bg-white print:text-black">
      {/* Top Header & Report Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              AUDIT & RECONCILIATION
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Verified Statement
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white mt-1">
            Financial Statements & Merchant Analytics
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="2026-10">October 2026 (Active Cycle)</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-08">August 2026</option>
          </select>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Printable Statement</span>
          </button>
        </div>
      </div>

      {/* Official Printable Statement Sheet */}
      <div className="rounded-2xl glass-card p-6 sm:p-8 border border-white/[0.1] shadow-2xl print:border-none print:shadow-none print:p-0">
        {/* Statement Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-white/[0.1] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black font-display text-white print:text-black">NEXORA</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                FINANCIAL STATEMENT
              </span>
            </div>
            <p className="text-xs text-slate-400 print:text-slate-600">
              Account Holder: <span className="text-white font-semibold print:text-black">{settings.userName}</span> ({settings.userTitle})
            </p>
            <p className="text-xs text-slate-400 print:text-slate-600 font-mono">
              Base Currency: {settings.currency.name} ({settings.currency.symbol} {settings.currency.code})
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-0.5 font-mono">
            <p className="text-slate-400">Statement Billing Cycle: <span className="text-white font-semibold print:text-black">{selectedPeriod}</span></p>
            <p className="text-slate-400">Generated: {new Date().toLocaleDateString()}</p>
            <p className="text-slate-400">Ledger Hash: <span className="text-cyan-400 font-mono">NX-2030-OCT-RECON</span></p>
          </div>
        </div>

        {/* Statement Financial Metrics Bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-white/[0.1]">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] print:border-slate-300">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Gross Total Inflow</span>
            <p className="text-xl font-bold font-mono-numbers text-emerald-400 mt-1">
              +{formatCurrency(periodIncome, settings.currency)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] print:border-slate-300">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Gross Total Outflow</span>
            <p className="text-xl font-bold font-mono-numbers text-rose-400 mt-1">
              -{formatCurrency(periodExpense, settings.currency)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] print:border-slate-300">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Net Accounting Surplus</span>
            <p
              className={`text-xl font-bold font-mono-numbers mt-1 ${
                periodNet >= 0 ? 'text-cyan-400' : 'text-amber-400'
              }`}
            >
              {periodNet >= 0 ? '+' : ''}
              {formatCurrency(periodNet, settings.currency)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] print:border-slate-300">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Savings Efficiency</span>
            <p className="text-xl font-bold font-mono-numbers text-white mt-1">
              {periodSavingsRate}%
            </p>
          </div>
        </div>

        {/* Top Merchants & Payment Modes Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-white/[0.1]">
          {/* Top Outflow Merchants */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-400" />
              <span>Top Merchant Outflows</span>
            </h4>
            <div className="space-y-2">
              {topMerchants.length === 0 ? (
                <p className="text-xs text-slate-500">No merchant outflows in this period.</p>
              ) : (
                topMerchants.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[180px]">
                      <span className="font-mono text-slate-500">{idx + 1}.</span>
                      <span className="text-white font-medium truncate">{m.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono-numbers text-white font-semibold">
                        {formatCurrency(m.total, settings.currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {m.percentage}% of cycle spend
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-violet-400" />
              <span>Payment Channel Share</span>
            </h4>
            <div className="space-y-2">
              {paymentMethodBreakdown.map((pm, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-medium">{pm.method}</span>
                    <span className="font-mono-numbers text-cyan-300 font-semibold">
                      {formatCurrency(pm.amount, settings.currency)} ({pm.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                      style={{ width: `${pm.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reconciled Transaction Table in Statement */}
        <div className="pt-6 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-white uppercase font-mono">
              Reconciled Statement Line Items ({periodTransactions.length})
            </h4>
            <span className="text-xs font-mono text-slate-500">Chronological Sort</span>
          </div>

          <div className="rounded-xl border border-white/[0.08] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] text-slate-400 font-mono">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Payee / Merchant</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {periodTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-mono text-slate-400">{t.date}</td>
                    <td className="p-3 text-white font-medium">{t.title}</td>
                    <td className="p-3 text-slate-400 font-mono">{t.paymentMethod}</td>
                    <td className="p-3 text-slate-400">{t.merchant || '-'}</td>
                    <td
                      className={`p-3 text-right font-mono-numbers font-semibold ${
                        t.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(t.amount, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
