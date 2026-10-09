import type { Car } from './types'

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=75`

/**
 * Starter inventory. Photos are Unsplash stand-ins matched to each model.
 * Swap `image` for real shots of the client's own cars (drop files in /public/fleet and use '/fleet/name.jpg').
 * Daily rates, plates and mileage are SAMPLE data.
 */
export const seedFleet: Car[] = [
  {
    id: 'toyota-camry', make: 'Toyota', model: 'Camry SE', year: 2024, category: 'Sedan',
    seats: 5, bags: 3, transmission: 'Automatic', fuel: 'Gas', dailyRate: 58,
    image: photo('1621007947382-bb3c3994e3fb'), color: 'Predawn Gray', plate: 'MTN-1042', mileage: 18240,
    status: 'available', features: ['Apple CarPlay', 'Adaptive cruise', 'Lane assist'],
  },
  {
    id: 'honda-crv', make: 'Honda', model: 'CR-V EX', year: 2023, category: 'SUV',
    seats: 5, bags: 4, transmission: 'Automatic', fuel: 'Gas', dailyRate: 69,
    image: photo('1519641471654-76ce0107ad1b'), color: 'Platinum White', plate: 'MTN-2087', mileage: 26915,
    status: 'available', features: ['AWD', 'Heated seats', 'Apple CarPlay'],
  },
  {
    id: 'ford-expedition', make: 'Ford', model: 'Expedition XLT', year: 2023, category: 'SUV',
    seats: 8, bags: 6, transmission: 'Automatic', fuel: 'Gas', dailyRate: 129,
    image: photo('1533473359331-0135ef1b58bf'), color: 'Star White', plate: 'MTN-3310', mileage: 31402,
    status: 'available', features: ['Third row', '4x4', 'Tow package'],
  },
  {
    id: 'tesla-model-3', make: 'Tesla', model: 'Model 3 Long Range', year: 2024, category: 'Electric',
    seats: 5, bags: 3, transmission: 'Automatic', fuel: 'Electric', dailyRate: 82,
    image: photo('1560958089-b8a1929cea89'), color: 'Pearl White', plate: 'MTN-4471', mileage: 9876,
    status: 'available', features: ['Autopilot', 'Supercharger access', 'Glass roof'],
  },
  {
    id: 'ford-mustang', make: 'Ford', model: 'Mustang GT', year: 2023, category: 'Sports',
    seats: 4, bags: 2, transmission: 'Automatic', fuel: 'Gas', dailyRate: 109,
    image: photo('1494976388531-d1058494cdd8'), color: 'Carbonized Gray', plate: 'MTN-5023', mileage: 14588,
    status: 'available', features: ['5.0L V8', 'Track apps', 'Premium audio'],
  },
  {
    id: 'chevrolet-camaro', make: 'Chevrolet', model: 'Camaro 2SS', year: 2023, category: 'Sports',
    seats: 4, bags: 2, transmission: 'Automatic', fuel: 'Gas', dailyRate: 104,
    image: photo('1552519507-da3b142c6e3d'), color: 'Riverside Blue', plate: 'MTN-5179', mileage: 17733,
    status: 'available', features: ['6.2L V8', 'Head-up display', 'Bose audio'],
  },
  {
    id: 'bmw-4-series', make: 'BMW', model: '430i Coupe', year: 2024, category: 'Luxury',
    seats: 4, bags: 2, transmission: 'Automatic', fuel: 'Gas', dailyRate: 118,
    image: photo('1502877338535-766e1452684a'), color: 'Portimao Blue', plate: 'MTN-6204', mileage: 8120,
    status: 'available', features: ['Leather', 'Harman Kardon', 'Parking assist'],
  },
  {
    id: 'bmw-m4', make: 'BMW', model: 'M4 Competition', year: 2023, category: 'Sports',
    seats: 4, bags: 2, transmission: 'Automatic', fuel: 'Gas', dailyRate: 189,
    image: photo('1580273916550-e323be2ae537'), color: 'Brooklyn Grey', plate: 'MTN-6650', mileage: 12904,
    status: 'available', features: ['503 hp', 'Carbon bucket seats', 'M Drive modes'],
  },
  {
    id: 'audi-rs6', make: 'Audi', model: 'RS 6 Avant', year: 2023, category: 'Luxury',
    seats: 5, bags: 4, transmission: 'Automatic', fuel: 'Gas', dailyRate: 219,
    image: photo('1606664515524-ed2f786a0bd6'), color: 'Mythos Black', plate: 'MTN-7015', mileage: 15467,
    status: 'available', features: ['Quattro AWD', 'Wagon cargo space', 'Bang & Olufsen'],
  },
  {
    id: 'porsche-panamera', make: 'Porsche', model: 'Panamera 4', year: 2022, category: 'Luxury',
    seats: 4, bags: 3, transmission: 'Automatic', fuel: 'Gas', dailyRate: 249,
    image: photo('1503376780353-7e6692767b70'), color: 'Jet Black', plate: 'MTN-7388', mileage: 21309,
    status: 'available', features: ['AWD', 'Adaptive air suspension', 'Bose surround'],
  },
  {
    id: 'mercedes-amg-gt', make: 'Mercedes-Benz', model: 'AMG GT', year: 2021, category: 'Sports',
    seats: 2, bags: 1, transmission: 'Automatic', fuel: 'Gas', dailyRate: 299,
    image: photo('1605559424843-9e4c228bf1c2'), color: 'Solarbeam Yellow', plate: 'MTN-8801', mileage: 11872,
    status: 'maintenance', features: ['Twin-turbo V8', 'Launch control', 'Burmester audio'],
  },
]
