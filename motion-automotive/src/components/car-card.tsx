import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Briefcase, Fuel, Users, Zap } from 'lucide-react'
import type { Car } from '@/data/types'
import { cn, money } from '@/lib/utils'
import { CarImage } from './car-image'

export function CarSpecs({ car, className }: { car: Car; className?: string }) {
  const FuelIcon = car.fuel === 'Electric' ? Zap : Fuel
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground', className)}>
      <li className="flex items-center gap-1.5"><Users className="h-4 w-4" strokeWidth={1.75} />{car.seats} seats</li>
      <li className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" strokeWidth={1.75} />{car.bags} bags</li>
      <li className="flex items-center gap-1.5"><FuelIcon className="h-4 w-4" strokeWidth={1.75} />{car.fuel}</li>
    </ul>
  )
}

export function CarCard({ car, available = true, search = '', index = 0 }: { car: Car; available?: boolean; search?: string; index?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col"
    >
      <Link to={`/fleet/${car.id}${search}`} className="absolute inset-0 z-10 rounded-3xl" aria-label={`${car.make} ${car.model} details`} />
      <div className="overflow-hidden rounded-3xl">
        <CarImage car={car} className={cn('aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]', !available && 'opacity-50 grayscale')} />
      </div>
      <div className="flex items-start justify-between gap-4 px-1 pt-4">
        <div>
          <p className="text-sm text-muted-foreground">{car.make} &middot; {car.category}</p>
          <h3 className="text-lg font-semibold tracking-tight">{car.model}</h3>
        </div>
        <p className="text-right">
          <span className="text-lg font-semibold">{money(car.dailyRate)}</span>
          <span className="block text-xs text-muted-foreground">per day</span>
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 px-1 pt-2">
        <CarSpecs car={car} />
        {!available && <span className="text-sm font-medium text-danger">{car.status === 'maintenance' ? 'In service' : 'Booked'}</span>}
      </div>
    </motion.article>
  )
}
