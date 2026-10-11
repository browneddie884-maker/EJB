import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { seedFleet } from '@/data/fleet'
import type { Car, Reservation, ReservationStatus } from '@/data/types'
import { rangesOverlap } from '@/lib/utils'

/**
 * Demo persistence: inventory and reservations live in this browser's localStorage.
 * For launch, replace load/save with calls to a real backend (e.g. Supabase or Firebase)
 * so staff and customers share the same data.
 */
const CARS_KEY = 'motion.cars.v3'
const RES_KEY = 'motion.reservations.v1'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: keep working in memory */
  }
}

function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = 'MA-'
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}

type Store = {
  cars: Car[]
  reservations: Reservation[]
  getCar: (id: string) => Car | undefined
  isAvailable: (carId: string, from?: string, to?: string, ignoreCode?: string) => boolean
  bookedRanges: (carId: string, ignoreCode?: string) => { pickup: string; dropoff: string }[]
  createReservation: (r: Omit<Reservation, 'code' | 'status' | 'createdAt'>) => Reservation
  updateReservation: (code: string, patch: Partial<Reservation>) => void
  setReservationStatus: (code: string, status: ReservationStatus) => void
  findReservation: (code: string, lastName: string) => Reservation | undefined
  upsertCar: (car: Car) => void
  removeCar: (id: string) => void
  resetDemo: () => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  // Bundled seed photos are not stored (they can be large data URIs); they are restored on load.
  const [cars, setCars] = useState<Car[]>(() =>
    load<Car[]>(CARS_KEY, seedFleet).map((c) => (c.image ? c : { ...c, image: seedFleet.find((s) => s.id === c.id)?.image ?? '' })),
  )
  const [reservations, setReservations] = useState<Reservation[]>(() => load(RES_KEY, []))

  useEffect(
    () => save(CARS_KEY, cars.map((c) => (c.image === seedFleet.find((s) => s.id === c.id)?.image ? { ...c, image: '' } : c))),
    [cars],
  )
  useEffect(() => save(RES_KEY, reservations), [reservations])

  const getCar = useCallback((id: string) => cars.find((c) => c.id === id), [cars])

  const isAvailable = useCallback(
    (carId: string, from?: string, to?: string, ignoreCode?: string) => {
      const car = cars.find((c) => c.id === carId)
      if (!car || car.status !== 'available') return false
      if (!from || !to) return true
      return !reservations.some(
        (r) =>
          r.carId === carId &&
          r.code !== ignoreCode &&
          (r.status === 'confirmed' || r.status === 'picked-up') &&
          rangesOverlap(from, to, r.pickup, r.dropoff),
      )
    },
    [cars, reservations],
  )

  const bookedRanges = useCallback(
    (carId: string, ignoreCode?: string) =>
      reservations
        .filter((r) => r.carId === carId && r.code !== ignoreCode && (r.status === 'confirmed' || r.status === 'picked-up'))
        .map((r) => ({ pickup: r.pickup, dropoff: r.dropoff })),
    [reservations],
  )

  const createReservation: Store['createReservation'] = useCallback((r) => {
    const reservation: Reservation = { ...r, code: makeCode(), status: 'confirmed', createdAt: new Date().toISOString() }
    setReservations((prev) => [reservation, ...prev])
    return reservation
  }, [])

  const updateReservation = useCallback((code: string, patch: Partial<Reservation>) => {
    setReservations((prev) => prev.map((r) => (r.code === code ? { ...r, ...patch } : r)))
  }, [])

  const setReservationStatus = useCallback(
    (code: string, status: ReservationStatus) => updateReservation(code, { status }),
    [updateReservation],
  )

  const findReservation = useCallback(
    (code: string, lastName: string) =>
      reservations.find(
        (r) =>
          r.code.toUpperCase() === code.trim().toUpperCase() &&
          r.driver.lastName.toLowerCase() === lastName.trim().toLowerCase(),
      ),
    [reservations],
  )

  const upsertCar = useCallback((car: Car) => {
    setCars((prev) => (prev.some((c) => c.id === car.id) ? prev.map((c) => (c.id === car.id ? car : c)) : [...prev, car]))
  }, [])

  const removeCar = useCallback((id: string) => setCars((prev) => prev.filter((c) => c.id !== id)), [])

  const resetDemo = useCallback(() => {
    setCars(seedFleet)
    setReservations([])
  }, [])

  const value = useMemo(
    () => ({ cars, reservations, getCar, isAvailable, bookedRanges, createReservation, updateReservation, setReservationStatus, findReservation, upsertCar, removeCar, resetDemo }),
    [cars, reservations, getCar, isAvailable, bookedRanges, createReservation, updateReservation, setReservationStatus, findReservation, upsertCar, removeCar, resetDemo],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
