import type { Car } from './types'

// Photos bundled from src/assets/fleet/<car id>.webp (or .jpg/.jpeg/.png). WebP keeps pages fast.
const photos = import.meta.glob<string>('../assets/fleet/*.{webp,jpg,jpeg,png}', { eager: true, import: 'default' })
const photo = (carId: string) =>
  ['webp', 'jpg', 'jpeg', 'png'].map((ext) => photos[`../assets/fleet/${carId}.${ext}`]).find(Boolean) ?? ''

/**
 * Starter inventory. Photos are Unsplash stand-ins matched to each model.
 * To use real shots of the client's cars, drop a photo in src/assets/fleet/ named after the car id (WebP preferred),
 * or set `image` to any URL from the staff dashboard.
 * Daily rates, plates and mileage are SAMPLE data.
 */
export const seedFleet: Car[] = [
  {
    id: 'toyota-camry', make: 'Toyota', model: 'Camry SE', year: 2024, category: 'Sedan',
    seats: 5, bags: 3, transmission: 'Automatic', fuel: 'Gas', dailyRate: 58,
    image: photo('toyota-camry'), color: 'Predawn Gray', plate: 'MTN-1042', mileage: 18240,
    status: 'available', features: ['Apple CarPlay', 'Adaptive cruise', 'Lane assist'],
  },
  {
    id: 'honda-crv', make: 'Honda', model: 'CR-V EX', year: 2023, category: 'SUV',
    seats: 5, bags: 4, transmission: 'Automatic', fuel: 'Gas', dailyRate: 69,
    image: photo('honda-crv'), color: 'Platinum White', plate: 'MTN-2087', mileage: 26915,
    status: 'available', features: ['AWD', 'Heated seats', 'Apple CarPlay'],
  },
  {
    id: 'ford-expedition', make: 'Ford', model: 'Expedition XLT', year: 2023, category: 'SUV',
    seats: 8, bags: 6, transmission: 'Automatic', fuel: 'Gas', dailyRate: 129,
    image: photo('ford-expedition'), color: 'Star White', plate: 'MTN-3310', mileage: 31402,
    status: 'available', features: ['Third row', '4x4', 'Tow package'],
  },
  {
    id: 'toyota-tacoma', make: 'Toyota', model: 'Tacoma TRD Off-Road', year: 2023, category: 'Truck',
    seats: 5, bags: 4, transmission: 'Automatic', fuel: 'Gas', dailyRate: 89,
    image: photo('toyota-tacoma'), color: 'Quicksand', plate: 'MTN-3452', mileage: 22618,
    status: 'available', features: ['4x4', 'Crawl control', 'Bed tie-downs'],
  },
  {
    id: 'ford-f150', make: 'Ford', model: 'F-150 XLT', year: 2023, category: 'Truck',
    seats: 5, bags: 5, transmission: 'Automatic', fuel: 'Gas', dailyRate: 99,
    image: photo('ford-f150'), color: 'Velocity Blue', plate: 'MTN-3518', mileage: 19734,
    status: 'available', features: ['SuperCrew cab', 'Tow package', 'Pro Power Onboard'],
  },
  {
    id: 'ford-f150-raptor', make: 'Ford', model: 'F-150 Raptor', year: 2022, category: 'Truck',
    seats: 5, bags: 4, transmission: 'Automatic', fuel: 'Gas', dailyRate: 179,
    image: photo('ford-f150-raptor'), color: 'Carbonized Gray', plate: 'MTN-3605', mileage: 27140,
    status: 'available', features: ['Fox Live Valve shocks', '4x4', 'Terrain management'],
  },
  {
    id: 'tesla-model-3', make: 'Tesla', model: 'Model 3 Long Range', year: 2024, category: 'Electric',
    seats: 5, bags: 3, transmission: 'Automatic', fuel: 'Electric', dailyRate: 82,
    image: photo('tesla-model-3'), color: 'Pearl White', plate: 'MTN-4471', mileage: 9876,
    status: 'available', features: ['Autopilot', 'Supercharger access', 'Glass roof'],
  },
  {
    id: 'ford-mustang', make: 'Ford', model: 'Mustang GT', year: 2023, category: 'Sports',
    seats: 4, bags: 2, transmission: 'Automatic', fuel: 'Gas', dailyRate: 109,
    image: photo('ford-mustang'), color: 'Carbonized Gray', plate: 'MTN-5023', mileage: 14588,
    status: 'available', features: ['5.0L V8', 'Track apps', 'Premium audio'],
  },
  {
    id: 'chevrolet-camaro', make: 'Chevrolet', model: 'Camaro 2SS', year: 2023, category: 'Sports',
    seats: 4, bags: 2, transmission: 'Automatic', fuel: 'Gas', dailyRate: 104,
    image: photo('chevrolet-camaro'), color: 'Riverside Blue', plate: 'MTN-5179', mileage: 17733,
    status: 'available', features: ['6.2L V8', 'Head-up display', 'Bose audio'],
  },
  {
    id: 'bmw-4-series', make: 'BMW', model: '430i Coupe', year: 2024, category: 'Luxury',
    seats: 4, bags: 2, transmission: 'Automatic', fuel: 'Gas', dailyRate: 118,
    image: photo('bmw-4-series'), color: 'Portimao Blue', plate: 'MTN-6204', mileage: 8120,
    status: 'available', features: ['Leather', 'Harman Kardon', 'Parking assist'],
  },
  {
    id: 'bmw-m4', make: 'BMW', model: 'M4 Competition', year: 2023, category: 'Sports',
    seats: 4, bags: 2, transmission: 'Automatic', fuel: 'Gas', dailyRate: 189,
    image: photo('bmw-m4'), color: 'Brooklyn Grey', plate: 'MTN-6650', mileage: 12904,
    status: 'available', features: ['503 hp', 'Carbon bucket seats', 'M Drive modes'],
  },
  {
    id: 'audi-rs6', make: 'Audi', model: 'RS 6 Avant', year: 2023, category: 'Luxury',
    seats: 5, bags: 4, transmission: 'Automatic', fuel: 'Gas', dailyRate: 219,
    image: photo('audi-rs6'), color: 'Mythos Black', plate: 'MTN-7015', mileage: 15467,
    status: 'available', features: ['Quattro AWD', 'Wagon cargo space', 'Bang & Olufsen'],
  },
  {
    id: 'porsche-panamera', make: 'Porsche', model: 'Panamera 4', year: 2022, category: 'Luxury',
    seats: 4, bags: 3, transmission: 'Automatic', fuel: 'Gas', dailyRate: 249,
    image: photo('porsche-panamera'), color: 'Jet Black', plate: 'MTN-7388', mileage: 21309,
    status: 'available', features: ['AWD', 'Adaptive air suspension', 'Bose surround'],
  },
  {
    id: 'mercedes-amg-gt', make: 'Mercedes-Benz', model: 'AMG GT', year: 2021, category: 'Sports',
    seats: 2, bags: 1, transmission: 'Automatic', fuel: 'Gas', dailyRate: 299,
    image: photo('mercedes-amg-gt'), color: 'Solarbeam Yellow', plate: 'MTN-8801', mileage: 11872,
    status: 'maintenance', features: ['Twin-turbo V8', 'Launch control', 'Burmester audio'],
  },
]
