import { Check, Minus, Plus } from 'lucide-react'
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
      <div className="checkbox-custom">
        {selected && <Check size={16} strokeWidth={4} />}
      </div>
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

