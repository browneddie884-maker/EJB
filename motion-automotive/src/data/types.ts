import type { CoveragePlanId } from '@/config/business'

export const categories = ['Sedan', 'SUV', 'Truck', 'Electric', 'Sports', 'Luxury'] as const
export type Category = (typeof categories)[number]

export type CarStatus = 'available' | 'maintenance' | 'retired'

export type Car = {
  id: string
  make: string
  model: string
  year: number
  category: Category
  seats: number
  bags: number
  transmission: 'Automatic' | 'Manual'
  fuel: 'Gas' | 'Hybrid' | 'Electric'
  dailyRate: number
  image: string
  color: string
  plate: string
  mileage: number
  status: CarStatus
  features: string[]
}

export type Insurance =
  | { type: 'own'; carrier: string; policyNumber: string; expires: string }
  | { type: 'motion'; plan: CoveragePlanId }

export type Driver = {
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseNumber: string
  licenseState: string
  age: number
}

export type ReservationStatus = 'confirmed' | 'picked-up' | 'returned' | 'cancelled'

export type Reservation = {
  code: string
  carId: string
  pickup: string
  dropoff: string
  locationId: string
  insurance: Insurance
  extras: string[]
  driver: Driver
  status: ReservationStatus
  total: number
  deposit: number
  createdAt: string
}
