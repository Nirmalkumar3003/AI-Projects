import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import {
  Sparkles,
  Plus,
  Bell,
  Search,
  Sun,
  Moon,
  Shield,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Menu,
  Terminal,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    settings,
    updateSettings,
    setIsQuickAddOpen,
    setIsNovaOpen,
    setIsCommandPaletteOpen,
    notifications,
    markNotificationRead,
    clearNotifications,
    totalBalance,
    isDemoDataActive,
    loadDemoData,
    clearAllData,
  } = useFinance();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/[0.08] backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu + Brand / Workspace indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#080b12] rounded-[11px] flex items-center justify-center">
                <span className="font-display font-black text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-violet-400 text-lg">
                  N
                </span>
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg tracking-wider text-white">NEXORA</span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-widest font-semibold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  OS 2030
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-numbers">
                <span>{currentTime}</span>
                <span className="text-slate-600">•</span>
                <span className="hidden sm:inline text-slate-400">{currentDate}</span>
              </div>
            </div>
          </div>

          {isDemoDataActive && (
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Demo Mode (₹ INR)</span>
            </div>
          )}
        </div>

        {/* Center: Quick Command search trigger */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/60 border border-white/[0.08] hover:border-cyan-500/40 text-slate-400 hover:text-slate-200 transition-all text-sm group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span>Search commands, transactions, categories...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[11px] font-mono bg-white/[0.06] border border-white/[0.1] rounded text-slate-400">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions (NOVA, Quick Add, Notifications, Theme, User) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ask NOVA AI button */}
          <button
            onClick={() => setIsNovaOpen(true)}
            className="relative group overflow-hidden flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600/30 via-cyan-600/20 to-violet-600/30 border border-violet-500/40 hover:border-cyan-400/60 text-white font-medium text-xs sm:text-sm transition-all shadow-lg shadow-violet-950/40 hover:shadow-cyan-500/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span className="hidden sm:inline">Ask</span>
            <span className="font-display font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-300">
              NOVA
            </span>
          </button>

          {/* Quick Add Expense button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Expense</span>
            <kbd className="hidden lg:inline px-1.5 py-0.2 text-[10px] font-mono bg-black/20 rounded text-slate-900">
              Q
            </kbd>
          </button>

          {/* Notification Center */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-panel border border-white/[0.12] p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">System Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No notifications at this time
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          n.read
                            ? 'bg-slate-900/40 border-white/[0.04] opacity-60'
                            : 'bg-white/[0.03] border-cyan-500/30 hover:border-cyan-500/60'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="shrink-0 mt-0.5">
                            {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                            {n.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white leading-tight">{n.title}</p>
                            <p className="text-[11px] text-slate-400 mt-1 leading-snug">{n.message}</p>
                            <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme switcher */}
          <button
            onClick={() =>
              updateSettings({
                theme: settings.theme === 'dark' ? 'light' : 'dark',
              })
            }
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 transition-colors"
            aria-label="Toggle Theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-violet-400" />
            )}
          </button>

          {/* User Profile Avatar & Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.2] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-xs font-bold text-slate-950 font-display">
                {settings.userName.charAt(0)}
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl glass-panel border border-white/[0.12] p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-sm font-bold text-slate-950 font-display">
                    {settings.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{settings.userName}</h4>
                    <p className="text-[11px] text-cyan-400 font-mono">{settings.userTitle}</p>
                  </div>
                </div>

                <div className="py-2.5 space-y-1 text-xs">
                  <div className="flex justify-between py-1 text-slate-400">
                    <span>Net Balance:</span>
                    <span className="font-mono-numbers text-white font-semibold">
                      {formatCurrency(totalBalance, settings.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-400">
                    <span>Active Currency:</span>
                    <span className="font-mono text-cyan-300">
                      {settings.currency.code} ({settings.currency.symbol})
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.08] space-y-1">
                  <button
                    onClick={() => {
                      loadDemoData();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    Reset to Indian Rupee Demo Data
                  </button>
                  <button
                    onClick={() => {
                      clearAllData();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    Purge All Ledger Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
