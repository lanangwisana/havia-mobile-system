"use client";

import React from 'react';
import {
  DollarSign, Briefcase, TrendingDown, Receipt, Tag
} from 'lucide-react';

// Props interface
interface FinanceContentProps {
  expenses: any[];
  isLoadingExpenses: boolean;
  colors: {
    gold: string;
    darkGold: string;
    bg: string;
    card: string;
    border: string;
    textMuted: string;
  };
}

// Currency formatter
const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
};

export default function FinanceContent({ expenses, isLoadingExpenses, colors }: FinanceContentProps) {
  const totalExpense = expenses.reduce((sum, exp) => {
    const amt = parseFloat(exp.amount || '0');
    const tax = parseFloat(exp.tax_amount || exp.tax || '0');
    const tax2 = parseFloat(exp.second_tax_amount || exp.second_tax || '0');
    return sum + amt + tax + tax2;
  }, 0);

  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0);
  const totalTax = expenses.reduce((sum, exp) => sum + parseFloat(exp.tax_amount || exp.tax || '0') + parseFloat(exp.second_tax_amount || exp.second_tax || '0'), 0);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 p-4" style={{ backgroundColor: colors.card }}>
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-red-500/10 blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Total Expense</span>
          </div>
          <p className="text-lg font-bold text-red-400 font-mono tracking-tight">{formatCurrency(totalExpense)}</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 p-4" style={{ backgroundColor: colors.card }}>
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-[#C69C3D]/10 blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#C69C3D]/10 border border-[#C69C3D]/20 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-[#C69C3D]" />
            </div>
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Jumlah</span>
          </div>
          <p className="text-lg font-bold text-[#C69C3D] font-mono tracking-tight">{expenses.length} <span className="text-xs font-normal text-neutral-500">item</span></p>
        </div>
      </div>

      {/* Amount & Tax Breakdown */}
      <div className="rounded-2xl border border-neutral-800 p-4 flex items-center justify-between" style={{ backgroundColor: colors.card }}>
        <div className="flex-1 text-center">
          <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Subtotal</p>
          <p className="text-sm font-bold text-white font-mono">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="w-px h-10 bg-neutral-800"></div>
        <div className="flex-1 text-center">
          <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Pajak</p>
          <p className="text-sm font-bold text-amber-400 font-mono">{formatCurrency(totalTax)}</p>
        </div>
      </div>

      {/* Expense List Header */}
      <div className="flex items-center justify-between px-1 pt-2">
        <h3 className="text-sm font-bold text-white tracking-wide">Daftar Expense</h3>
        <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-widest">{expenses.length} Data</span>
      </div>

      {/* Expense List */}
      {isLoadingExpenses ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest">Memuat Expenses...</p>
        </div>
      ) : expenses.length > 0 ? (
        <div className="space-y-3">
          {expenses.map((expense: any, idx: number) => {
            const amount = parseFloat(expense.amount || '0');
            const taxAmt = parseFloat(expense.tax_amount || expense.tax || '0');
            const tax2Amt = parseFloat(expense.second_tax_amount || expense.second_tax || '0');
            const total = amount + taxAmt + tax2Amt;
            const expDate = expense.expense_date || expense.date || '';
            const category = expense.category_name || expense.category || 'Umum';
            const title = expense.title || 'Expense';
            const description = expense.description || '';

            // Parse description to get Client, Project, Team member
            const descParts = description.split('\n').filter((s: string) => s.trim());

            return (
              <div key={expense.id || idx} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-2xl border relative overflow-hidden group hover:border-[#C69C3D]/30 transition-all shadow-lg">
                {/* Left accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#C69C3D] to-red-500/50"></div>
                
                <div className="p-4 pl-5">
                  {/* Top row: date + total */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm leading-tight">{title}</h4>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          {expDate ? new Date(expDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400 font-mono">{formatCurrency(total)}</p>
                      {taxAmt > 0 && <p className="text-[9px] text-amber-500/80 mt-0.5">inc. tax {formatCurrency(taxAmt)}</p>}
                    </div>
                  </div>

                  {/* Category Tag */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#C69C3D]/10 border border-[#C69C3D]/20 rounded-lg text-[9px] font-bold uppercase tracking-widest text-[#C69C3D]">
                      <Tag className="w-3 h-3" /> {category}
                    </span>
                    {expense.project_title && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-bold uppercase tracking-widest text-blue-400">
                        <Briefcase className="w-3 h-3" /> {expense.project_title}
                      </span>
                    )}
                  </div>

                  {/* Description lines (Client, Project, Team member from API) */}
                  {descParts.length > 0 && (
                    <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-800/50 space-y-1">
                      {descParts.map((line: string, lineIdx: number) => (
                        <p key={lineIdx} className="text-[11px] text-neutral-400 leading-relaxed">
                          {line.trim()}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Bottom: amount breakdown */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-800/50">
                    <div>
                      <p className="text-[8px] text-neutral-500 uppercase tracking-[0.2em] mb-0.5">Amount</p>
                      <p className="text-[11px] text-white font-medium font-mono">{formatCurrency(amount)}</p>
                    </div>
                    {taxAmt > 0 && (
                      <div>
                        <p className="text-[8px] text-neutral-500 uppercase tracking-[0.2em] mb-0.5">Tax</p>
                        <p className="text-[11px] text-amber-400 font-medium font-mono">{formatCurrency(taxAmt)}</p>
                      </div>
                    )}
                    {tax2Amt > 0 && (
                      <div>
                        <p className="text-[8px] text-neutral-500 uppercase tracking-[0.2em] mb-0.5">Tax 2</p>
                        <p className="text-[11px] text-amber-400 font-medium font-mono">{formatCurrency(tax2Amt)}</p>
                      </div>
                    )}
                    <div className="ml-auto">
                      <p className="text-[8px] text-neutral-500 uppercase tracking-[0.2em] mb-0.5">Total</p>
                      <p className="text-[11px] text-red-400 font-bold font-mono">{formatCurrency(total)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#2C2A29] rounded-3xl border border-neutral-800 border-dashed">
          <DollarSign className="w-12 h-12 text-neutral-600 mb-4" />
          <p className="text-xs text-neutral-500 tracking-widest uppercase font-bold text-center px-8">Belum ada data expense<br/>untuk saat ini</p>
        </div>
      )}
    </div>
  );
}
