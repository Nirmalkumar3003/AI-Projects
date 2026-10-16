import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { DynamicIcon } from '../common/DynamicIcon';
import { Layers, PieChart as PieIcon, TrendingUp, AlertTriangle } from 'lucide-react';

export const ChartsSection: React.FC = () => {
  const {
    categorySpendBreakdown,
    dailyCashFlow,
    currentMonthExpenses,
    currentMonthIncome,
    settings,
    budgets,
  } = useFinance();

  const [activeChartTab, setActiveChartTab] = useState<'cashflow' | 'area'>('cashflow');

  // Custom Tooltip for Cash Flow Bar Chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl glass-panel border border-cyan-500/40 shadow-xl text-xs space-y-1.5">
          <p className="font-mono text-slate-300 font-semibold">{label}</p>
          <div className="flex items-center justify-between gap-4 text-emerald-400">
            <span>Inflow:</span>
            <span className="font-mono font-bold">
              {formatCurrency(payload[0]?.value || 0, settings.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-rose-400">
            <span>Outflow:</span>
            <span className="font-mono font-bold">
              {formatCurrency(payload[1]?.value || 0, settings.currency)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Donut Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-xl glass-panel border border-violet-500/40 shadow-xl text-xs space-y-1">
          <p className="font-semibold text-white flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.categoryColor }}
            />
            {data.categoryName}
          </p>
          <p className="font-mono text-cyan-300 font-bold">
            {formatCurrency(data.total, settings.currency)}
          </p>
          <p className="text-[11px] text-slate-400">
            {data.percentage}% of monthly expenditures
          </p>
          {data.budgetAmount && (
            <p className="text-[11px] text-slate-400">
              Budget: {formatCurrency(data.budgetAmount, settings.currency)} ({data.budgetUtilization}%)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6">
      {/* Left 7 Columns: Inflow vs Outflow Cashflow Chart / Area Trajectory */}
      <div className="lg:col-span-7 rounded-2xl glass-card p-5 border border-white/[0.08] flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                  CASH-FLOW TELEMETRY
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              </div>
              <h4 className="text-lg font-bold text-white font-display mt-0.5">
                Liquidity Velocity & Outflow Patterns
              </h4>
            </div>

            {/* Toggle chart views */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/[0.08]">
              <button
                onClick={() => setActiveChartTab('cashflow')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeChartTab === 'cashflow'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Inflow vs Outflow
              </button>
              <button
                onClick={() => setActiveChartTab('area')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeChartTab === 'area'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cumulative Net
              </button>
            </div>
          </div>

          <div className="h-68 w-full mt-2">
            {dailyCashFlow.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <Layers className="w-8 h-8 mb-2 opacity-50" />
                <span>No transaction activity recorded yet for chart synthesis</span>
              </div>
            ) : activeChartTab === 'cashflow' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyCashFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={10}
                    tickFormatter={(val) => val.substring(5)}
                    tickLine={false}
                  />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="income" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="expense" name="Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyCashFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cyberArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={10}
                    tickFormatter={(val) => val.substring(5)}
                    tickLine={false}
                  />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="net"
                    name="Net Cash Flow"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#cyberArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bottom Legend & Quick Stats */}
        <div className="flex flex-wrap items-center justify-between pt-4 mt-2 border-t border-white/[0.06] text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
              <span className="text-slate-400">Total Inflow:</span>
              <span className="font-mono-numbers text-emerald-400 font-bold">
                {formatCurrency(currentMonthIncome, settings.currency)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
              <span className="text-slate-400">Total Outflow:</span>
              <span className="font-mono-numbers text-rose-400 font-bold">
                {formatCurrency(currentMonthExpenses, settings.currency)}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">Deterministic Synced</span>
        </div>
      </div>

      {/* Right 5 Columns: Category Spending Donut Chart & Utilization Matrix */}
      <div className="lg:col-span-5 rounded-2xl glass-card p-5 border border-white/[0.08] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-violet-400">
                CATEGORY COMPOSITION
              </span>
              <h4 className="text-lg font-bold text-white font-display mt-0.5">
                Spending Allocation
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-400">October 2026</span>
          </div>

          {categorySpendBreakdown.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
              <PieIcon className="w-8 h-8 mb-2 opacity-50" />
              <span>No expense records for category allocation</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Donut Chart */}
              <div className="sm:col-span-6 h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie
                      data={categorySpendBreakdown}
                      dataKey="total"
                      nameKey="categoryName"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {categorySpendBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.categoryColor || '#38bdf8'}
                          stroke="rgba(0,0,0,0.5)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                  </RechartsPie>
                </ResponsiveContainer>
                {/* Center metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Total</span>
                  <span className="text-xs font-bold font-mono-numbers text-white">
                    {formatCurrency(currentMonthExpenses, settings.currency, { compact: true })}
                  </span>
                </div>
              </div>

              {/* Top 4 Categories List with utilization pills */}
              <div className="sm:col-span-6 space-y-2.5">
                {categorySpendBreakdown.slice(0, 4).map((cat) => {
                  const isCritical = cat.budgetUtilization && cat.budgetUtilization > 85;
                  const isWarning = cat.budgetUtilization && cat.budgetUtilization >= 70 && cat.budgetUtilization <= 85;

                  return (
                    <div key={cat.categoryId} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: cat.categoryColor }}
                          />
                          <span className="text-slate-300 font-medium truncate">{cat.categoryName}</span>
                        </div>
                        <span className="font-mono-numbers text-white font-semibold">
                          {formatCurrency(cat.total, settings.currency)}
                        </span>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, cat.percentage)}%`,
                            backgroundColor: cat.categoryColor,
                          }}
                        />
                      </div>

                      {cat.budgetUtilization !== undefined && (
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-0.5">
                          <span>
                            {cat.budgetUtilization}% of{' '}
                            {formatCurrency(cat.budgetAmount || 0, settings.currency, { compact: true })} cap
                          </span>
                          {cat.isOverBudget && (
                            <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> Over limit
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-3 mt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
          <span>{categorySpendBreakdown.length} active spending sectors</span>
          <span className="text-violet-400 font-mono text-[11px]">Real-Time Breakdown</span>
        </div>
      </div>
    </div>
  );
};
