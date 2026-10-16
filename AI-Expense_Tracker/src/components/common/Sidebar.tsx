import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Repeat,
  FileBarChart,
  Sparkles,
  Settings,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, setIsCsvImportOpen, setIsNovaOpen, savingsRate } = useFinance();

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Smart Budgets', icon: PieChart },
    { id: 'savings', label: 'Savings Vaults', icon: Target },
    { id: 'recurring', label: 'Recurring & Bills', icon: Repeat },
    { id: 'reports', label: 'Analytics & Reports', icon: FileBarChart },
    { id: 'nova', label: 'NOVA AI Intelligence', icon: Sparkles, highlight: true },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const content = (
    <div className="h-full flex flex-col justify-between py-5 px-3">
      {/* Top Nav Items */}
      <div className="space-y-1">
        <div className="px-3 pb-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          <span>Navigation Terminal</span>
          <button onClick={onCloseMobile} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 border border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-cyan-400'
                      : item.highlight
                      ? 'text-violet-400 group-hover:text-cyan-300'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.highlight && !isActive && (
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
              )}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom widgets & quick actions */}
      <div className="space-y-3 pt-4 border-t border-white/[0.08]">
        {/* Financial health telemetry widget */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">FINANCIAL HEALTH</span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
              <Zap className="w-3 h-3" />
              <span>OPTIMAL</span>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] text-slate-500">Savings Runway</p>
              <p className="text-lg font-bold font-display text-white">{savingsRate}%</p>
            </div>
            <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, savingsRate))}%` }}
              />
            </div>
          </div>
        </div>

        {/* CSV Import button */}
        <button
          onClick={() => {
            setIsCsvImportOpen(true);
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          <span>Import CSV Statement</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4.5rem)] sticky top-18 glass-panel border-r border-white/[0.08]">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 glass-panel border-r border-white/[0.1] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
