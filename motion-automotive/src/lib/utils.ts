import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n % 1 ? 2 : 0 })

/** yyyy-mm-dd in local time */
export function isoDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return isoDate(d)
}

export function daysBetween(from: string, to: string) {
  const a = new Date(from + 'T12:00:00').getTime()
  const b = new Date(to + 'T12:00:00').getTime()
  return Math.max(1, Math.round((b - a) / 86_400_000))
}

export function prettyDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function rangesOverlap(aFrom: string, aTo: string, bFrom: string, bTo: string) {
  return aFrom < bTo && bFrom < aTo
}
