import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';
import { ChatMessage } from '../../types';

const SUGGESTED_PROMPTS = [
  'Where did my money go this month?',
  'Can I afford a ₹15,000 purchase this month?',
  'Predict my expenses by the end of this month.',
  'Create a realistic savings plan for me.',
  'Which categories are exceeding my budget?',
  'How much can I save if I reduce dining expenses by 20%?',
];

export const NovaAssistantView: React.FC = () => {
  const {
    transactions,
    categories,
    budgets,
    savingsGoals,
    recurringTotals,
    totalBalance,
    currentMonthIncome,
    currentMonthExpenses,
    savingsRate,
    settings,
  } = useFinance();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Greetings, Commander ${settings.userName}. I am **NOVA**, your autonomous financial intelligence engine.\n\nI have synthesized your live telemetry:\n- **Net Liquidity:** **${settings.currency.symbol}${totalBalance.toLocaleString()}**\n- **October Inflow vs Outflow:** **+${settings.currency.symbol}${currentMonthIncome.toLocaleString()}** / **-${settings.currency.symbol}${currentMonthExpenses.toLocaleString()}**\n- **Savings Efficiency:** **${savingsRate}%**\n\nHow may I optimize your capital runway today? Ask me about upcoming purchase feasibility, budget compressions, or end-of-month predictive forecasts.`,
      timestamp: new Date().toISOString(),
      model: 'gemini-3.8-flash',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTelemetryContext, setShowTelemetryContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare comprehensive financial context for the backend
      const topCategories = categories.map((c) => {
        const total = transactions
          .filter((t) => t.category === c.id && t.type === 'expense' && t.date.startsWith('2026-10'))
          .reduce((sum, t) => sum + t.amount, 0);
        return { name: c.name, total };
      }).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

      const contextPayload = {
        currencySymbol: settings.currency.symbol,
        currencyCode: settings.currency.code,
        balance: totalBalance,
        monthlyIncome: currentMonthIncome,
        monthlyExpenses: currentMonthExpenses,
        savingsRate,
        topCategories,
        budgets,
        savingsGoals: savingsGoals.map((g) => ({
          name: g.name,
          currentAmount: g.currentAmount,
          targetAmount: g.targetAmount,
          targetDate: g.targetDate,
        })),
        recurringMonthlyTotal: recurringTotals.expense,
        recentTransactions: transactions.slice(0, 10).map((t) => ({
          title: t.title,
          amount: t.amount,
          type: t.type,
          category: t.category,
          date: t.date,
          merchant: t.merchant,
        })),
      };

      const res = await fetch('/api/nova/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: contextPayload,
          conversationHistory: messages.slice(-5),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-nova`,
        role: 'assistant',
        content: data.reply || 'NOVA synthesized your query successfully.',
        timestamp: new Date().toISOString(),
        model: data.model || 'gemini-3.8-flash',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Error contacting NOVA AI:', err);
      // Fallback message
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `I have analyzed your live data via the deterministic calculation engine:\n\n- **Current Balance:** **${settings.currency.symbol}${totalBalance.toLocaleString()}**\n- **October Outflow:** **${settings.currency.symbol}${currentMonthExpenses.toLocaleString()}**\n- **Net Operational Surplus:** **${settings.currency.symbol}${(currentMonthIncome - currentMonthExpenses).toLocaleString()}**\n- **Savings Velocity:** **${savingsRate}%**\n\n*(Telemetry rendered seamlessly via local reserve engine)*`,
        timestamp: new Date().toISOString(),
        model: 'NOVA-Deterministic-Engine',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col rounded-3xl glass-card border border-white/[0.1] shadow-2xl overflow-hidden animate-in fade-in duration-300">
      {/* Top NOVA Header */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-slate-950/60 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#080b12] rounded-[15px] flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#080b12]"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-display">NOVA Neural Assistant</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
                Gemini 3.8 Flash Core
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time financial synthesis, purchase evaluations & trajectory predictions
            </p>
          </div>
        </div>

        {/* Telemetry context drawer toggle */}
        <button
          onClick={() => setShowTelemetryContext(!showTelemetryContext)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-mono transition-colors"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Telemetry Context</span>
          {showTelemetryContext ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Expandable Telemetry Context Inspector */}
      {showTelemetryContext && (
        <div className="p-4 bg-slate-900/90 border-b border-cyan-500/30 text-xs text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono animate-in slide-in-from-top-2 shrink-0">
          <div>
            <span className="text-slate-500 block">LEDGER BALANCE</span>
            <span className="text-white font-bold">{formatCurrency(totalBalance, settings.currency)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">OCTOBER INFLOW</span>
            <span className="text-emerald-400 font-bold">+{formatCurrency(currentMonthIncome, settings.currency)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">OCTOBER OUTFLOW</span>
            <span className="text-rose-400 font-bold">-{formatCurrency(currentMonthExpenses, settings.currency)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">SAVINGS VELOCITY</span>
            <span className="text-cyan-400 font-bold">{savingsRate}% Rate</span>
          </div>
        </div>
      )}

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl ${
                isUser ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-cyan-500 text-slate-950 font-display'
                    : 'bg-violet-600/30 border border-violet-500/40 text-cyan-300'
                }`}
              >
                {isUser ? settings.userName.charAt(0) : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none shadow-lg shadow-cyan-500/20'
                    : 'glass-panel border border-white/[0.08] text-slate-200 rounded-tl-none whitespace-pre-wrap shadow-xl'
                }`}
              >
                {/* Render text with basic markdown formatting */}
                <div
                  className="space-y-2 prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdownToHtml(msg.content),
                  }}
                />

                <div
                  className={`mt-2 pt-2 border-t text-[10px] font-mono flex items-center justify-between ${
                    isUser
                      ? 'border-slate-950/20 text-slate-900/80'
                      : 'border-white/[0.06] text-slate-500'
                  }`}
                >
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.model && <span>{msg.model}</span>}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 max-w-2xl">
            <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/40 text-cyan-300 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>NOVA is synthesizing your real-time ledger telemetry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 border-t border-white/[0.06] bg-slate-950/40 overflow-x-auto whitespace-nowrap flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-mono text-slate-500 uppercase shrink-0">Prompts:</span>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 border-t border-white/[0.08] bg-slate-950/80 backdrop-blur-xl flex items-center gap-3 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask NOVA anything about your money, budgets, or purchase decisions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-xl bg-slate-900/80 border border-white/[0.1] text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

// Simple Markdown Formatter Helper
function formatMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/^### (.*$)/gim, '<h4 class="font-bold text-white text-sm my-1">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="font-bold text-white text-base my-1.5">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-cyan-300">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-200">$1</li>')
    .replace(/\n\n/g, '<br/>');
}
