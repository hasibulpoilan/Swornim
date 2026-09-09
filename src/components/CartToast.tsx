import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'

type CartToastProps = {
  message: string
  open: boolean
  onClose: () => void
}

export function CartToast({ message, open, onClose }: CartToastProps) {
  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(onClose, 2800)
    return () => window.clearTimeout(t)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="cart-toast" role="status">
      <div className="cart-toast-main">
        <span className="cart-toast-icon">
          <Check size={18} strokeWidth={3} />
        </span>
        <div>
          <p className="cart-toast-msg">{message}</p>
          <Link to="/cart" className="cart-toast-link" onClick={onClose}>
            View cart
          </Link>
        </div>
      </div>
      <button type="button" className="cart-toast-close" onClick={onClose} aria-label="Close">
        <X size={16} />
      </button>
    </div>
  )
}
