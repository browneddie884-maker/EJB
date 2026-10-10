import type { Quote } from '@/lib/pricing'
import { business } from '@/config/business'
import { money } from '@/lib/utils'

export function PriceSummary({ q, coverageLabel }: { q: Quote; coverageLabel?: string }) {
  const rows: [string, number][] = [
    [`Car, ${q.days} ${q.days === 1 ? 'day' : 'days'}`, q.base],
    [`Weekly rate, ${Math.round(business.weeklyDiscount * 100)}% off`, -q.weeklySaving],
    [coverageLabel ?? 'Coverage', q.coverage],
    ['Extras', q.extras],
    ['Young driver fee', q.youngDriver],
    ['Taxes and fees', q.tax],
  ]
  return (
    <div className="text-sm">
      <dl className="space-y-2">
        {rows
          .filter(([label, v]) => v !== 0 || label.startsWith('Car') || label.startsWith('Taxes'))
          .map(([label, v]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className={v < 0 ? 'text-ok' : undefined}>{v < 0 ? `-${money(-v)}` : money(v)}</dd>
            </div>
          ))}
      </dl>
      <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
        <span className="font-medium">Total</span>
        <span className="text-2xl font-semibold">{money(q.total)}</span>
      </div>
      <p className="mt-2 text-muted-foreground">Plus a {money(q.deposit)} refundable hold on your card at pickup.</p>
    </div>
  )
}
