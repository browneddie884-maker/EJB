import { useState } from 'react'
import { CarFront } from 'lucide-react'
import type { Car } from '@/data/types'
import { cn } from '@/lib/utils'

export function CarImage({ car, className, eager }: { car: Car; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  if (failed || !car.image) {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground', className)}>
        <CarFront className="h-8 w-8" strokeWidth={1.5} />
        <span className="text-sm">Photo coming soon</span>
      </div>
    )
  }
  return (
    <img
      src={car.image}
      alt={`${car.year} ${car.make} ${car.model} in ${car.color}`}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      className={cn('bg-muted object-cover', className)}
    />
  )
}
