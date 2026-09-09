import { MessageCircle, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'

type CartBarProps = {
  selectedCount: number
  cartCount: number
  onSendWhatsApp: () => void
}

export function CartBar({
  selectedCount,
  cartCount,
  onSendWhatsApp,
}: CartBarProps) {
  const noneSelected = selectedCount === 0

  return (
    <div className="order-bar">
      <div className="order-bar-main">
        <div className="order-bar-header">
          <div>
            <h3>Your Order</h3>
            <p>
              {noneSelected
                ? 'Select items from the menu'
                : `${selectedCount} item${selectedCount > 1 ? 's' : ''} ready`}
            </p>
          </div>
          {cartCount > 0 && (
            <Link to="/cart" className="cart-link">
              <ShoppingCart size={26} />
              Cart ({cartCount})
            </Link>
          )}
        </div>
      </div>

      <button
        type="button"
        className="btn-order"
        disabled={noneSelected}
        onClick={onSendWhatsApp}
      >
        <MessageCircle size={20} />
        Send via WhatsApp
      </button>
    </div>
  )
}
