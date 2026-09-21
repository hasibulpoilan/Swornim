import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Minus, Plus } from 'lucide-react'
import type { MenuItem } from '../types'

type ProductCardProps = {
  item: MenuItem
  selected: boolean
  qty?: number
  onToggleSelect: () => void
  onAddToCart: () => void
  onIncrement?: () => void
  onDecrement?: () => void
}

export function ProductCard({
  item,
  selected,
  qty = 0,
  onToggleSelect,
  onAddToCart,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  const isInCart = qty > 0
  const [isExpanded, setIsExpanded] = useState(false)

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isExpanded])

  return (
    <div
      className={`item-card ${selected ? 'selected' : ''} ${isInCart ? 'in-cart' : ''}`}
      onClick={onToggleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggleSelect()
        }
      }}
    >
      
      {item.imageUrl && (
        <>
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(true)
            }}
            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', marginRight: '12px', flexShrink: 0, cursor: 'pointer' }} 
          />
          {isExpanded && createPortal(
            <div 
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.85)',
                zIndex: 999999,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                animation: 'fadeIn 0.2s ease-out'
              }}
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(false)
              }}
            >
              <div 
                style={{
                  animation: 'zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  maxWidth: '90%',
                  maxHeight: '90%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    maxHeight: '50vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}
                />
                <h2 style={{ margin: '0 0 12px 0', textAlign: 'center', color: '#333' }}>{item.name}</h2>
                {item.price && <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)' }}>{item.price}</div>}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(false)
                  }}
                  style={{
                    marginTop: '20px',
                    padding: '10px 32px',
                    borderRadius: '24px',
                    border: 'none',
                    backgroundColor: '#e2e8f0',
                    color: '#334155',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#cbd5e1'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                >
                  Close
                </button>
              </div>
            </div>,
            document.body
          )}
        </>
      )}
      
      <div className="item-info">
        <div className="item-name">{item.name}</div>
        {item.price && <div className="item-price">{item.price}</div>}
      </div>

      {isInCart ? (
        <div className="qty-stepper" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="qty-btn"
            onClick={(e) => {
              e.stopPropagation()
              onDecrement?.()
            }}
            aria-label={`Decrease ${item.name} quantity`}
          >
            <Minus size={14} strokeWidth={3} />
          </button>
          <span className="qty-count">{qty}</span>
          <button
            type="button"
            className="qty-btn"
            onClick={(e) => {
              e.stopPropagation()
              onIncrement?.()
            }}
            aria-label={`Increase ${item.name} quantity`}
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="add-btn"
          onClick={(e) => {
            e.stopPropagation()
            onAddToCart()
          }}
          aria-label={`Add ${item.name} to cart`}
        >
          <Plus size={16} strokeWidth={3} />
          Add to cart
        </button>
      )}
    </div>
  )
}

