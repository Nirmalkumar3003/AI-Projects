import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Gauge,
  Percent,
} from 'lucide-react';

export const StatCards: React.FC = () => {
  const {
    totalBalance,
    currentMonthIncome,
    currentMonthExpenses,
    availableBudget,
    savingsRate,
    momExpenseChange,
    settings,
  } = useFinance();

  const cards = [
    {
      id: 'stat-balance',
      title: 'Total Net Liquidity',
      amount: totalBalance,
      icon: Wallet,
      color: 'from-cyan-500/20 to-blue-600/10',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400/60',
      textColor: 'text-cyan-400',
      badge: 'Real-time Ledger',
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      subtext: `Starting base: ${formatCurrency(settings.startingBalance, settings.currency, { compact: true })}`,
    },
    {
      id: 'stat-income',
      title: 'October Gross Inflow',
      amount: currentMonthIncome,
      icon: ArrowDownLeft,
      color: 'from-emerald-500/20 to-teal-600/10',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400/60',
      textColor: 'text-emerald-400',
      badge: '+ Inflow',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      subtext: 'Reconciled salary, consulting & passive',
    },
    {
      id: 'stat-expenses',
      title: 'October Total Outflow',
      amount: currentMonthExpenses,
      icon: ArrowUpRight,
      color: 'from-rose-500/20 to-pink-600/10',
      borderColor: 'border-rose-500/30 hover:border-rose-400/60',
      textColor: 'text-rose-400',
      badge: '- Outflow',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      subtext: 'Operating expenses & lifestyle costs',
    },
    {
      id: 'stat-budget',
      title: 'Remaining Budget Cap',
      amount: availableBudget,
      icon: Gauge,
      color: 'from-violet-500/20 to-purple-600/10',
      borderColor: 'border-violet-500/30 hover:border-violet-400/60',
      textColor: 'text-violet-400',
      badge: 'Unallocated Cap',
      badgeColor: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      subtext: 'Across all active category allocations',
    },
    {
      id: 'stat-savings-rate',
      title: 'Savings Efficiency Rate',
      rawText: `${savingsRate}%`,
      icon: Percent,
      color: 'from-amber-500/20 to-orange-600/10',
      borderColor: 'border-amber-500/30 hover:border-amber-400/60',
      textColor: 'text-amber-400',
      badge: savingsRate >= 20 ? 'Benchmark Exceeded' : 'Target: 25%',
      badgeColor: savingsRate >= 20 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      subtext: 'Retained capital vs gross inflow',
    },
    {
      id: 'stat-mom',
      title: 'MoM Spending Trajectory',
      rawText: `${momExpenseChange.percentage}%`,
      icon: momExpenseChange.direction === 'increased' ? TrendingUp : TrendingDown,
      color: 'from-indigo-500/20 to-cyan-600/10',
      borderColor: 'border-indigo-500/30 hover:border-indigo-400/60',
      textColor: momExpenseChange.direction === 'increased' ? 'text-amber-400' : 'text-emerald-400',
      badge: momExpenseChange.direction === 'increased' ? 'Outflow Rising' : 'Outflow Lower',
      badgeColor: momExpenseChange.direction === 'increased' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      subtext: 'Compared against September burn rate',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`relative overflow-hidden p-5 rounded-2xl glass-card border ${card.borderColor} transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl`}
          >
            {/* Background glowing radial sheen */}
            <div
              className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${card.color} blur-2xl pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity`}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div
                  className={`p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] ${card.textColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-2 mt-1">
                <h3 className="text-2xl sm:text-3xl font-extrabold font-display font-mono-numbers text-white tracking-tight">
                  {card.rawText ? card.rawText : formatCurrency(card.amount!, settings.currency)}
                </h3>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06] text-xs">
                <span className="text-slate-400 truncate max-w-[170px]">{card.subtext}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
