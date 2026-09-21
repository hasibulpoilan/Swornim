import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatRs } from '../cart/cartUtils'

type CartBarProps = {
  selectedCount: number
  cartCount: number
  totalPrice?: number
}

export function CartBar({
  selectedCount,
  cartCount,
  totalPrice = 0,
}: CartBarProps) {
  const hasSelected = selectedCount > 0

  return (
    <div className="order-bar">
      <div className="order-bar-main">
        <div className="order-bar-header">
          <div>
            <h3>Your Order</h3>
            <p>
              {!hasSelected ? (
                'Select items from the menu'
              ) : (
                <>
                  {selectedCount} item{selectedCount > 1 ? 's' : ''} ready
                  {totalPrice > 0 && (
                    <span className="order-bar-price-tag">
                      {' · '}Total: <strong>{formatRs(totalPrice)}</strong>
                    </span>
                  )}
                </>
              )}
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
    </div>
  )
}
