import { business, coveragePlans, extras as extraList } from '@/config/business'
import type { Car, Insurance } from '@/data/types'
import { daysBetween } from './utils'

export type Quote = {
  days: number
  base: number
  coverage: number
  extras: number
  youngDriver: number
  tax: number
  total: number
  deposit: number
}

export function quote(opts: {
  car: Car
  pickup: string
  dropoff: string
  insurance?: Insurance
  extras?: string[]
  locationId?: string
  driverAge?: number
}): Quote {
  const days = daysBetween(opts.pickup, opts.dropoff)
  const base = opts.car.dailyRate * days
  const ins = opts.insurance
  const plan = ins?.type === 'motion' ? coveragePlans.find((p) => p.id === ins.plan) : undefined
  const coverage = plan ? plan.perDay * days : 0
  const extras = (opts.extras ?? []).reduce((sum, id) => {
    const e = extraList.find((x) => x.id === id)
    return sum + (e?.perDay ? e.perDay * days : e?.flat ?? 0)
  }, 0)
  const youngDriver =
    opts.driverAge && opts.driverAge < business.youngDriverAge ? business.youngDriverFeePerDay * days : 0
  const subtotal = base + coverage + extras + youngDriver
  const tax = Math.round(subtotal * business.taxRate * 100) / 100
  const deposit = opts.insurance?.type === 'own' ? business.deposit.ownInsurance : business.deposit.motionCoverage
  return { days, base, coverage, extras, youngDriver, tax, total: Math.round((subtotal + tax) * 100) / 100, deposit }
}
