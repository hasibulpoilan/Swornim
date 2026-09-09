import type { MenuCategory } from '../types'

export const MENU: MenuCategory[] = [
  {
    category: 'Sandwiches & Burgers',
    items: [
      { id: 's1', name: 'Veg Corn Sandwich', price: 'Rs. 50' },
      { id: 's2', name: 'Cheese Veg Corn Sandwich', price: 'Rs. 65' },
      { id: 's3', name: 'Special Veg Cheese Corn Sandwich', price: 'Rs. 80' },
      { id: 's4', name: 'Chicken Sandwich', price: 'Rs. 100' },
      { id: 's5', name: 'Veg Burger', price: 'Rs. 75' },
    ],
  },
  {
    category: 'Mother Dairy (Singles)',
    items: [
      { id: 'm1', name: 'Cones & Bars' },
      { id: 'm2', name: 'Ice Candy' },
      { id: 'm3', name: 'Traditional Kulfi' },
      { id: 'm4', name: 'Single Cups' },
      { id: 'm5', name: 'Novelty Ice Creams' },
    ],
  },
  {
    category: 'Mother Dairy (Family)',
    items: [
      { id: 'f1', name: 'Classic Tubs' },
      { id: 'f2', name: 'Treat Tubs' },
      { id: 'f3', name: 'Ultimate Tubs' },
      { id: 'f4', name: 'Dietz (Sugar Free Options)' },
      { id: 'f5', name: 'Super Saver Packs' },
    ],
  },
]

/** WhatsApp number with country code, digits only. */
export const WHATSAPP_NUMBER = '918240017974'

