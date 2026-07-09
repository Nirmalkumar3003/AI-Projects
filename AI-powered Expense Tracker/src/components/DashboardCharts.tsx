import { useMemo } from "react";
import { Transaction, CATEGORY_COLORS } from "../types";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { PieChart as PieIcon, BarChart3 } from "lucide-react";

interface DashboardChartsProps {
  transactions: Transaction[];
}

export default function DashboardCharts({ transactions }: DashboardChartsProps) {
  // 1. Calculate pie chart data (expenses by category)
  const pieData = useMemo(() => {
    const categoriesSum: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoriesSum[t.category] = (categoriesSum[t.category] || 0) + t.amount;
      });

    return Object.entries(categoriesSum).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  }, [transactions]);

  // 2. Calculate daily chart data (income vs expense over time)
  const dailyData = useMemo(() => {
    // Group transactions by date (last 7 days or just sorted dates in active month)
    const grouped: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach((t) => {
      // Keep date format simple
      const dateStr = t.date;
      if (!grouped[dateStr]) {
        grouped[dateStr] = { income: 0, expense: 0 };
      }
      if (t.type === "income") {
        grouped[dateStr].income += t.amount;
      } else {
        grouped[dateStr].expense += t.amount;
      }
    });

    return Object.entries(grouped)
      .map(([date, values]) => ({
        date,
        income: parseFloat(values.income.toFixed(2)),
        expense: parseFloat(values.expense.toFixed(2)),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Keep last 7 transaction days for beautiful space layout
  }, [transactions]);

  const hasExpenses = pieData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Spending Breakdown (Pie) */}
      <div id="category-distribution-card" className="p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border-zinc-200/50 dark:border-zinc-800/50 shadow-xl flex flex-col h-[360px]">
        <div className="flex items-center gap-2.5 mb-4">
          <PieIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Category Breakdown
          </h2>
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center">
          {hasExpenses ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name] || "#6b7280"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, "Expense"]}
                  contentStyle={{
                    backgroundColor: "rgba(30, 41, 59, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-zinc-600 dark:text-zinc-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-zinc-400 dark:text-zinc-500 text-sm flex flex-col items-center">
              <PieIcon className="w-8 h-8 mb-2 stroke-1" />
              <span>No expenses found to build breakdown chart.</span>
            </div>
          )}
        </div>
      </div>

      {/* Daily Cash Flow (Bar) */}
      <div id="cash-flow-card" className="p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border-zinc-200/50 dark:border-zinc-800/50 shadow-xl flex flex-col h-[360px]">
        <div className="flex items-center gap-2.5 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Daily Cash Flow (Last 7 Active Days)
          </h2>
        </div>

        <div className="flex-1 min-h-0">
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120,120,120,0.1)" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                />
                <Tooltip
                  formatter={(value: any) => [`$${value}`, ""]}
                  contentStyle={{
                    backgroundColor: "rgba(30, 41, 59, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  iconType="rect"
                  iconSize={10}
                  formatter={(value) => (
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">{value}</span>
                  )}
                />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-zinc-400 dark:text-zinc-500 text-sm h-full flex flex-col items-center justify-center">
              <BarChart3 className="w-8 h-8 mb-2 stroke-1" />
              <span>No transactions recorded to show flow.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
