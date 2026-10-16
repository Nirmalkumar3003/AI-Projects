import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { StatCards } from './StatCards';
import { ChartsSection } from './ChartsSection';
import { RecentActivity } from './RecentActivity';
import { formatCurrency } from '../../utils/formatters';
import {
  Sparkles,
  Plus,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const {
    settings,
    totalBalance,
    currentMonthIncome,
    currentMonthExpenses,
    savingsRate,
    setIsQuickAddOpen,
    setIsNovaOpen,
    insights,
    refreshInsights,
    isGeneratingInsights,
    setActiveTab,
  } = useFinance();

  // Time-based personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const netSurplus = currentMonthIncome - currentMonthExpenses;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Hero Command Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-white/[0.1] shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>NEXORA CORE ACTIVE • RUNWAY CALIBRATED</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
              {getGreeting()},{' '}
              <span className="gradient-text-cyber">{settings.userName}</span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Your October cash reserves are performing with an extraordinary{' '}
              <span className="text-emerald-400 font-semibold font-mono-numbers">
                {savingsRate}%
              </span>{' '}
              savings velocity. Net operational surplus stands at{' '}
              <span className="text-cyan-300 font-semibold font-mono-numbers">
                {netSurplus >= 0 ? '+' : ''}
                {formatCurrency(netSurplus, settings.currency)}
              </span>
              .
            </p>
          </div>

          {/* Quick Hero Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsNovaOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-200 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-violet-950/40"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Ask NOVA AI</span>
            </button>

            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log Transaction</span>
            </button>
          </div>
        </div>
      </div>

      {/* Proactive NOVA Telemetry & Strategic Insights */}
      {insights.length > 0 && (
        <div className="p-4 rounded-2xl glass-card border border-white/[0.08]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
                PROACTIVE NOVA INTELLIGENCE & TELEMETRY
              </h4>
            </div>

            <button
              onClick={refreshInsights}
              disabled={isGeneratingInsights}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingInsights ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Analysis</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {insights.map((ins) => {
              const isWarning = ins.type === 'warning';
              const isAchievement = ins.type === 'achievement';
              const isOpportunity = ins.type === 'opportunity';

              return (
                <div
                  key={ins.id}
                  className={`p-3.5 rounded-xl border text-xs transition-all hover:border-cyan-500/40 ${
                    isWarning
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : isAchievement
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : isOpportunity
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
                      : 'bg-violet-500/10 border-violet-500/30 text-violet-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-white truncate">{ins.title}</span>
                    <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-black/30 font-bold">
                      {ins.metric}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 leading-relaxed">{ins.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main 6 Bento Summary Cards */}
      <StatCards />

      {/* Interactive Charts Section (Inflow vs Outflow & Donut Breakdown) */}
      <ChartsSection />

      {/* Financial Activity Timeline */}
      <RecentActivity />
    </div>
  );
};
