import React, { useState, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { parseCSV } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Transaction } from '../../types';

export const CsvImportModal: React.FC = () => {
  const {
    isCsvImportOpen,
    setIsCsvImportOpen,
    categories,
    transactions,
    importCsvTransactions,
    settings,
  } = useFinance();

  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [parsedResult, setParsedResult] = useState<{
    valid: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[];
    errors: { row: number; error: string; raw: string }[];
    duplicates: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCsvImportOpen) return null;

  const handleClose = () => {
    setIsCsvImportOpen(false);
    setCsvContent('');
    setFileName('');
    setParsedResult(null);
    setStep('upload');
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a valid .csv file');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvContent(text);
      const result = parseCSV(text, categories, transactions);
      setParsedResult(result);
      setStep('preview');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedResult && parsedResult.valid.length > 0) {
      importCsvTransactions(parsedResult.valid);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 p-6 z-10 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Transaction Statement</h3>
              <p className="text-xs text-slate-400">
                Reconcile bank CSV exports, UPI passbooks, or external spreadsheets
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4">
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-500/10 scale-[0.99]'
                    : 'border-white/[0.15] bg-slate-900/40 hover:border-cyan-500/40 hover:bg-slate-900/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-lg shadow-cyan-950/40">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Drag and drop your bank CSV here, or <span className="text-cyan-400 underline">browse</span>
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Supports standard CSV statements containing Date, Amount, Description/Merchant, and optional Category.
                </p>
              </div>

              {/* Sample format hint */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                <span className="font-mono text-cyan-400 uppercase font-semibold block mb-1">
                  Expected CSV Schema Example:
                </span>
                <code className="font-mono text-[11px] text-slate-300 block bg-black/40 p-2 rounded-lg overflow-x-auto">
                  Date,Amount,Title,Category,Payment Method,Merchant
                  <br />
                  2026-10-14,2400.00,Shell V-Power Premium Fuel,Transportation,UPI,Shell
                  <br />
                  2026-10-15,1499.00,GitHub Copilot Enterprise,Tech,Credit Card,GitHub
                </code>
              </div>
            </div>
          )}

          {step === 'preview' && parsedResult && (
            <div className="space-y-4">
              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold">Valid Rows</span>
                  </div>
                  <span className="text-xl font-bold font-mono-numbers">
                    {parsedResult.valid.length}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold">Duplicates Skipped</span>
                  </div>
                  <span className="text-xl font-bold font-mono-numbers">
                    {parsedResult.duplicates}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-semibold">Format Errors</span>
                  </div>
                  <span className="text-xl font-bold font-mono-numbers">
                    {parsedResult.errors.length}
                  </span>
                </div>
              </div>

              {/* Error log if any */}
              {parsedResult.errors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs">
                  <p className="font-semibold text-rose-300 mb-1">Issues Detected:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-rose-200/80 max-h-24 overflow-y-auto">
                    {parsedResult.errors.map((err, i) => (
                      <li key={i}>
                        Row {err.row}: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data Preview Table */}
              <div>
                <p className="text-xs font-mono text-slate-400 uppercase font-semibold mb-2">
                  Preview Valid Records ({parsedResult.valid.length}):
                </p>
                <div className="max-h-60 overflow-y-auto rounded-xl border border-white/[0.08] bg-slate-900/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.04] text-slate-400 font-mono sticky top-0 border-b border-white/[0.08]">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Title</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Amount</th>
                        <th className="p-2.5">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {parsedResult.valid.slice(0, 15).map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="p-2.5 font-mono text-slate-400">{row.date}</td>
                          <td className="p-2.5 text-white font-medium truncate max-w-[180px]">
                            {row.title}
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                row.type === 'income'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {row.type}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono-numbers text-white font-semibold">
                            {formatCurrency(row.amount, settings.currency)}
                          </td>
                          <td className="p-2.5 text-slate-400">{row.paymentMethod}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedResult.valid.length > 15 && (
                  <p className="text-[11px] text-slate-500 mt-1 italic">
                    Showing first 15 records of {parsedResult.valid.length} total.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between shrink-0">
          {step === 'preview' ? (
            <button
              onClick={() => setStep('upload')}
              className="text-xs font-semibold text-slate-400 hover:text-white"
            >
              Choose different file
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>

            {step === 'preview' && (
              <button
                disabled={!parsedResult || parsedResult.valid.length === 0}
                onClick={handleConfirmImport}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Commit {parsedResult?.valid.length || 0} Transactions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
