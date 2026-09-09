import { Check, Plus } from 'lucide-react'
import type { MenuItem } from '../types'

type ProductCardProps = {
  item: MenuItem
  selected: boolean
  onToggleSelect: () => void
  onAddToCart: () => void
}

export function ProductCard({
  item,
  selected,
  onToggleSelect,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div
      className={`item-card ${selected ? 'selected' : ''}`}
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
    </div>
  )
}
