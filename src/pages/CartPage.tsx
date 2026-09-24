import { ArrowLeft, MessageCircle, Minus, Plus, Trash2, AlertCircle, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../cart/CartContext'
import { cartLineTotal, formatRs, isPastCutoffTime, getTimeRemainingToCutoff } from '../cart/cartUtils'

export function CartPage() {
  const cart = useCart()
  const empty = cart.items.length === 0
  const hasUnpriced = cart.items.some((i) => i.unitPrice === null)

  const [userDetails, setUserDetails] = useState({ name: '', phone: '', address: '' })
  const [showError, setShowError] = useState(false)
  const [showMoqModal, setShowMoqModal] = useState(false)
  const navigate = useNavigate()

  // Force re-render every second to keep time live
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const pastCutoff = isPastCutoffTime()
  const timeRemaining = getTimeRemainingToCutoff()
  
  const sameDayItems = pastCutoff ? [] : cart.items.filter(i => i.qty <= 10)
  const nextDayItems = pastCutoff ? cart.items : cart.items.filter(i => i.qty > 10)

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
      
      <style>{`
        @keyframes blinker {
          50% { opacity: 0.3; }
        }
        .blink-text {
          animation: blinker 1.5s linear infinite;
          color: #ea580c;
        }
      `}</style>

      {!empty && (
        <div className="blink-text" style={{ textAlign: 'center', margin: '0 20px 24px', fontSize: '16px', backgroundColor: '#fff3e0', padding: '12px', borderRadius: '8px', border: '1px solid #ffcc80' }}>
          <strong>Kindly note:</strong> Minimum order amount should be ₹ 300.
        </div>
      )}


      {empty ? (
        <div className="cart-empty">
          <Link to="/" className="btn-order">
            Browse menu
          </Link>
        </div>
      ) : (
        <>
          <div style={{
            backgroundColor: pastCutoff ? '#e2e3e5' : '#e8f5e9',
            color: pastCutoff ? '#383d41' : '#155724',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '14px',
            border: `1px solid ${pastCutoff ? '#d6d8db' : '#c3e6cb'}`,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            {/* LEFT SIDE: Items Lists */}
            <div style={{ flex: '1 1 auto', minWidth: '280px' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 'bold', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: pastCutoff ? '#6c757d' : '#28a745' }}></span>
                Important Note
              </div>
              
              {pastCutoff ? (
                <p style={{ margin: 0, fontSize: '15px' }}>All items will be delivered <strong>TOMORROW</strong>.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {nextDayItems.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.4)', padding: '12px', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 6px 0' }}>Delivered <strong>tomorrow</strong> (qty &gt; 10):</p>
                      <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.4' }}>
                        {nextDayItems.map(i => <li key={i.id}>{i.name}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {sameDayItems.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.4)', padding: '12px', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 6px 0' }}>Delivered <strong>today</strong>:</p>
                      <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.4' }}>
                        {sameDayItems.map(i => <li key={i.id}>{i.name}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Timer */}
            <div style={{
              flex: '0 0 auto',
              textAlign: 'center',
              backgroundColor: pastCutoff ? 'rgba(0,0,0,0.05)' : '#ffffff',
              padding: '16px 20px',
              borderRadius: '12px',
              minWidth: '240px',
              boxShadow: pastCutoff ? 'none' : '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <strong style={{ display: 'block', marginBottom: pastCutoff ? '0' : '8px', fontSize: '16px' }}>
                {pastCutoff ? '🌙 Delivery closed' : '⏳ Want it today?'}
              </strong>
              
              {!pastCutoff && timeRemaining && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: '13px', opacity: 0.85 }}>Order in the next</div>
                  <strong style={{ 
                    background: '#e8f5e9',
                    color: '#155724', 
                    padding: '6px 12px', 
                    borderRadius: '8px',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: '18px',
                    display: 'inline-block',
                    border: '1px solid #c3e6cb'
                  }}>{timeRemaining.hrs}h {timeRemaining.mins}m {timeRemaining.secs}s</strong>
                </div>
              )}
            </div>
          </div>
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

          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Delivery Details</h3>
            
            {showError && (
              <div style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold' }}>
                Please fill in all details (name, phone, address) to proceed.
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={userDetails.name}
                onChange={(e) => {
                  setUserDetails(d => ({ ...d, name: e.target.value }))
                  if (showError) setShowError(false)
                }}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: showError && !userDetails.name.trim() ? '2px solid #d32f2f' : '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' }}
              />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={userDetails.phone}
                onChange={(e) => {
                  setUserDetails(d => ({ ...d, phone: e.target.value }))
                  if (showError) setShowError(false)
                }}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: showError && !userDetails.phone.trim() ? '2px solid #d32f2f' : '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' }}
              />
              <textarea 
                placeholder="Full Delivery Address" 
                value={userDetails.address}
                onChange={(e) => {
                  setUserDetails(d => ({ ...d, address: e.target.value }))
                  if (showError) setShowError(false)
                }}
                rows={3}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: showError && !userDetails.address.trim() ? '2px solid #d32f2f' : '1px solid #ccc', fontSize: '15px', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
          </div>


          <div className="blink-text" style={{ textAlign: 'center', marginBottom: '12px', fontSize: '16px' }}>
            <strong>Kindly note:</strong> Minimum order amount should be ₹ 300.
          </div>
          <div className="cart-page-summary">
            <div style={{ flex: '1', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#555', fontSize: '15px' }}>
                <span>Subtotal</span>
                <strong>{formatRs(cart.subtotal)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#555', fontSize: '15px' }}>
                <span>Handling & Delivery</span>
                <strong>+ {formatRs(60)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #ccc', paddingTop: '12px', alignItems: 'center' }}>
                <span className="order-total-label" style={{ margin: 0, color: '#1c1917', fontSize: '16px' }}>
                  {hasUnpriced ? 'Estimated Total' : 'Total Payable'}
                </span>
                <strong className="cart-page-total" style={{ color: '#ea580c', fontSize: '1.4rem' }}>
                  {formatRs(cart.subtotal + 60)}
                </strong>
              </div>
            </div>
            <button
              type="button"
              className="btn-order"
              onClick={() => {
                if (cart.subtotal < 300) {
                  setShowMoqModal(true)
                  return
                }
                if (!userDetails.name.trim() || !userDetails.phone.trim() || !userDetails.address.trim()) {
                  setShowError(true)
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                  return
                }
                cart.sendCartWhatsApp(userDetails)
              }}
            >
              <MessageCircle size={20} />
              Send via WhatsApp
            </button>
          </div>
        </>
      )}

      {showMoqModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowMoqModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
            >
              <X size={24} />
            </button>
            
            <AlertCircle size={56} color="#ea580c" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ margin: '0 0 12px', fontSize: '22px', color: '#1c1917' }}>Almost there!</h2>
            <p style={{ margin: '0 0 24px', color: '#555', fontSize: '16px', lineHeight: '1.5' }}>
              Please add <strong>{formatRs(300 - cart.subtotal)}</strong> more to reach our minimum order amount of <strong>₹300</strong>.
            </p>
            <button 
              className="btn-order" 
              onClick={() => {
                setShowMoqModal(false)
                navigate('/')
              }}
              style={{ width: '100%' }}
            >
              Browse Menu & Add Items
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
