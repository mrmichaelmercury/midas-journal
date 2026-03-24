import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(abs)
  return value < 0 ? `-${formatted}` : formatted
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function getPnlColor(pnl: number): string {
  if (pnl > 0) return 'text-emerald-400'
  if (pnl < 0) return 'text-red-400'
  return 'text-gray-400'
}

export function getPnlBg(pnl: number): string {
  if (pnl > 0) return 'bg-emerald-400/10 border-emerald-400/20'
  if (pnl < 0) return 'bg-red-400/10 border-red-400/20'
  return 'bg-gray-400/10 border-gray-400/20'
}
