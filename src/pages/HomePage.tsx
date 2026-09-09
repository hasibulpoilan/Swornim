import { MapPin, Phone, Globe, Lock } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { useMenu } from '../menu/MenuContext'
import { ProductCard } from '../components/ProductCard'
import { CartBar } from '../components/CartBar'
import { CartToast } from '../components/CartToast'
import type { MenuItem } from '../types'

export function HomePage() {
  const cart = useCart()
  const { menu, loading } = useMenu()
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const closeToast = useCallback(() => setToastOpen(false), [])

  const handleAdd = (item: MenuItem) => {
    cart.addItem(item)
    setToastMsg(`${item.name} added to cart`)
    setToastOpen(true)
  }

  return (
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
        {loading && <p className="menu-loading">Loading menu…</p>}
        {menu.map((section) => (
          <div key={section.category} className="menu-category">
            <h2 className="category-title">{section.category}</h2>
            <div className="items-grid">
              {section.items.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  selected={cart.isSelected(item.id)}
                  onToggleSelect={() => cart.toggleSelect(item)}
                  onAddToCart={() => handleAdd(item)}
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
              +91 82400 17974
            </div>
            <div className="contact-row">
              <Globe size={18} color="var(--primary)" />
              www.swornimdelicacies.com
            </div>
            <div className="admin-footer-link">
              <Link to="/admin">
                <Lock size={14} /> Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      <CartBar
        selectedCount={cart.selected.length}
        cartCount={cart.count}
        onSendWhatsApp={cart.sendSelectedWhatsApp}
      />

      <CartToast message={toastMsg} open={toastOpen} onClose={closeToast} />
    </div>
  )
}
