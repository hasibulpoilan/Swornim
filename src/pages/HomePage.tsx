import {
  MapPin,
  Phone,
  Globe,
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react'
import { useCallback, useMemo, useState, useEffect } from 'react'
import { useCart } from '../cart/CartContext'
import { isPastCutoffTime } from '../cart/cartUtils'
import { useMenu } from '../menu/MenuContext'
import { ProductCard } from '../components/ProductCard'
import { CartBar } from '../components/CartBar'
import { CartToast } from '../components/CartToast'
import type { MenuItem } from '../types'

const NON_VEG_KEYWORDS = ['chicken', 'egg', 'mutton', 'fish', 'prawn', 'sausage', 'bacon']

function isNonVeg(name: string): boolean {
  const lower = name.toLowerCase()
  return NON_VEG_KEYWORDS.some((kw) => lower.includes(kw))
}

function parseItemPrice(priceStr?: string): number {
  if (!priceStr) return Infinity
  const cleaned = priceStr.replace(/rs\.?/gi, '').replace(/,/g, '').trim()
  const match = cleaned.match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : Infinity
}

export function HomePage() {
  const cart = useCart()
  const { menu, loading } = useMenu()
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL')
  const [priceSort, setPriceSort] = useState<'DEFAULT' | 'LOW_HIGH' | 'HIGH_LOW'>('DEFAULT')

  const closeToast = useCallback(() => setToastOpen(false), [])

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedCategory('ALL')
    setDietaryFilter('ALL')
    setPriceSort('DEFAULT')
  }, [])

  const handleAdd = (item: MenuItem) => {
    cart.addItem(item)
    setToastMsg(`${item.name} added to cart`)
    setToastOpen(true)
  }

  const totalItemCount = useMemo(() => {
    return menu.reduce((acc, cat) => acc + cat.items.length, 0)
  }, [menu])

  const filteredMenu = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return menu
      .map((section) => {
        if (selectedCategory !== 'ALL' && section.category !== selectedCategory) {
          return null
        }

        let items = section.items.filter((item) => {
          if (q && !item.name.toLowerCase().includes(q)) {
            return false
          }

          const nonVeg = isNonVeg(item.name)
          if (dietaryFilter === 'VEG' && nonVeg) return false
          if (dietaryFilter === 'NON_VEG' && !nonVeg) return false

          return true
        })

        if (priceSort === 'LOW_HIGH') {
          items = [...items].sort((a, b) => parseItemPrice(a.price) - parseItemPrice(b.price))
        } else if (priceSort === 'HIGH_LOW') {
          items = [...items].sort((a, b) => {
            const pa = parseItemPrice(a.price)
            const pb = parseItemPrice(b.price)
            if (pa === Infinity) return 1
            if (pb === Infinity) return -1
            return pb - pa
          })
        }

        if (items.length === 0) return null

        return {
          category: section.category,
          items,
        }
      })
      .filter(Boolean) as typeof menu
  }, [menu, searchQuery, selectedCategory, dietaryFilter, priceSort])

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'ALL' ||
    dietaryFilter !== 'ALL' ||
    priceSort !== 'DEFAULT'

  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(timer)
  }, [])
  const pastCutoff = isPastCutoffTime()

  return (
    <>
      <div style={{
        backgroundColor: pastCutoff ? '#343a40' : '#28a745',
        color: 'white',
        textAlign: 'center',
        padding: '8px 16px',
        fontWeight: 'bold',
        fontSize: '14px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        {pastCutoff 
          ? '🌙 Currently accepting orders for Tomorrow!' 
          : '🚚 Order by 8:30 PM for Same-Day Delivery!'}
      </div>
      <div className="split-layout">
        <div className="left-panel">
        <div className="left-panel-content">
          <img
            src="/images/logo.jpeg"
            alt="Swornim Global Delicacies Logo"
            className="brand-logo"
          />
          <h1>
            Swornim Global <br />
            <span className="brand-accent">Delicacies</span>
          </h1>
          <p className="brand-tagline">
            Authentic tastes crafted with premium ingredients. Select your
            favorites below to order instantly.
          </p>
          <div className="mini-gallery desktop-only">
            <img src="/images/1.webp" alt="Swornim Shop 1" className="mini-img" />
            <img src="/images/2.webp" alt="Swornim Shop 2" className="mini-img" />
            <img src="/images/3.webp" alt="Swornim Shop 3" className="mini-img" />
            <img src="/images/4.webp" alt="Swornim Shop 4" className="mini-img" />
          </div>
        </div>
      </div>

      <div className="right-panel">
        {/* Search & Filter Bar */}
        <div className="menu-filter-container">
          <div className="search-input-wrap">
            <Search className="search-icon-left" size={20} />
            <input
              type="text"
              className="menu-search-input"
              placeholder="Search items by name… e.g. Rasogolla, Sandwich, Coffee"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="compact-dropdowns-row">
            {/* 1. Category Dropdown */}
            <div className="filter-select-wrap">
              <span className="filter-label-icon">📁</span>
              <select
                className="filter-dropdown"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">All Categories ({totalItemCount})</option>
                {menu.map((sec) => (
                  <option key={sec.category} value={sec.category}>
                    {sec.category} ({sec.items.length})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Dietary Filter Dropdown */}
            <div className="filter-select-wrap">
              <span className="filter-label-icon">🥗</span>
              <select
                className="filter-dropdown"
                value={dietaryFilter}
                onChange={(e) => setDietaryFilter(e.target.value as typeof dietaryFilter)}
              >
                <option value="ALL">All Types (Veg & Non-Veg)</option>
                <option value="VEG">🟢 Veg Only</option>
                <option value="NON_VEG">🔴 Non-Veg Only</option>
              </select>
            </div>

            {/* 3. Price Sort Dropdown */}
            <div className="filter-select-wrap">
              <SlidersHorizontal size={16} color="var(--primary)" />
              <select
                className="filter-dropdown"
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as typeof priceSort)}
              >
                <option value="DEFAULT">Sort: Default</option>
                <option value="LOW_HIGH">Price: Low to High</option>
                <option value="HIGH_LOW">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {loading && <p className="menu-loading">Loading menu…</p>}

        {!loading && filteredMenu.length === 0 && (
          <div className="menu-empty-state">
            <h3>No items match your search</h3>
            <p>
              We couldn't find any items matching your selected search or filters.
            </p>
            {hasActiveFilters && (
              <button type="button" className="btn-reset-filters" onClick={resetFilters}>
                <RotateCcw size={16} /> Clear All Filters
              </button>
            )}
          </div>
        )}

        {filteredMenu.map((section) => (
          <div key={section.category} className="menu-category">
            <h2 className="category-title">{section.category}</h2>
            <div className="items-grid">
              {section.items.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  selected={cart.isSelected(item.id)}
                  qty={cart.getQty(item.id)}
                  onToggleSelect={() => cart.toggleSelect(item)}
                  onAddToCart={() => handleAdd(item)}
                  onIncrement={() => cart.increment(item.id)}
                  onDecrement={() => cart.decrement(item.id)}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="mini-gallery mobile-only">
          <img src="/images/1.webp" alt="Swornim Shop 1" className="mini-img" />
          <img src="/images/2.webp" alt="Swornim Shop 2" className="mini-img" />
          <img src="/images/3.webp" alt="Swornim Shop 3" className="mini-img" />
          <img src="/images/4.webp" alt="Swornim Shop 4" className="mini-img" />
        </div>

        <div className="find-us">
          <h2 className="category-title find-us-title">Find Us Here</h2>
          <div className="map-wrap">
            <iframe
              src="https://maps.google.com/maps?q=Swornim%20Global%20Delicacies%20Private%20Limited,%20Kolkata&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Swornim location map"
            />
          </div>
          <div className="contact-block">
            <strong className="contact-name">
              Swornim Global Delicacies Pvt. Ltd.
            </strong>
            <div className="contact-row">
              <MapPin size={18} color="var(--primary)" />
              Santwana Villa, Kalitala, Garia Road, Kolkata 700084
            </div>
            <div className="contact-row">
              <Phone size={18} color="var(--primary)" />
              +91 90734 34301
            </div>
          </div>
        </div>
      </div>

      <CartBar
        selectedCount={cart.selected.length}
        cartCount={cart.count}
        totalPrice={cart.selectedSubtotal}
      />

      <CartToast message={toastMsg} open={toastOpen} onClose={closeToast} />
    </div>
    </>
  )
}

