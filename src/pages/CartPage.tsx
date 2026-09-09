import { ArrowLeft, MessageCircle, Minus, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { cartLineTotal, formatRs } from '../cart/cartUtils'

export function CartPage() {
  const cart = useCart()
  const empty = cart.items.length === 0
  const hasUnpriced = cart.items.some((i) => i.unitPrice === null)

  return (
    <div className="cart-page">
      <header className="cart-page-header">
        <Link to="/" className="cart-back">
          <ArrowLeft size={20} />
          Back to menu
        </Link>
        <h1>Your Cart</h1>
        <p>
          {empty
            ? 'No items yet — add something from the menu.'
            : `${cart.count} item${cart.count > 1 ? 's' : ''} · edit quantity or remove below`}
        </p>
      </header>

      {empty ? (
        <div className="cart-empty">
          <Link to="/" className="btn-order">
            Browse menu
          </Link>
        </div>
      ) : (
        <>
          <ul className="cart-page-list">
            {cart.items.map((item) => {
              const line = cartLineTotal(item)
              return (
                <li key={item.id} className="cart-page-row">
                  <div className="cart-page-row-info">
                    <h2>{item.name}</h2>
                    <p className="cart-page-unit">
                      {item.unitPrice !== null
                        ? `${formatRs(item.unitPrice)} each`
                        : 'Price on request'}
                    </p>
                    {line !== null && (
                      <p className="cart-page-line-total">{formatRs(line)}</p>
                    )}
                  </div>
                  <div className="cart-page-row-actions">
                    <div className="cart-qty-control">
                      <button
                        type="button"
                        className="qty-btn"
                        aria-label={`Decrease ${item.name}`}
                        onClick={() => cart.decrement(item.id)}
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>
                      <span className="qty-value">{item.qty}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        aria-label={`Increase ${item.name}`}
                        onClick={() => cart.increment(item.id)}
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="remove-btn remove-btn--lg"
                      onClick={() => cart.removeItem(item.id)}
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="cart-page-summary">
            <div>
              <span className="order-total-label">
                {hasUnpriced ? 'Estimated total' : 'Total'}
              </span>
              <strong className="cart-page-total">{formatRs(cart.subtotal)}</strong>
            </div>
            <button
              type="button"
              className="btn-order"
              onClick={cart.sendCartWhatsApp}
            >
              <MessageCircle size={20} />
              Send via WhatsApp
            </button>
          </div>
        </>
      )}
    </div>
  )
}
