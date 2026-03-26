import { useCart } from '../../context/CartContext'
import './Checkout.css'

function Cart({ onCheckout, onContinueShopping }) {
  const { cart, cartTotal, deliveryFee, updateQuantity, removeFromCart } = useCart()

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any products yet.</p>
          <button 
            className="continue-shopping-btn"
            onClick={onContinueShopping}
          >
            ← Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-page-header">
        <h1>MY CART ({cart.length} items)</h1>
      </div>

      <div className="cart-page-grid">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                🌿
              </div>
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>{item.type} • {item.thc} THC</p>
                <p className="cart-item-price">KES {item.price.toLocaleString()}</p>
                
                <div className="cart-item-quantity">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <button 
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
                <span style={{ fontWeight: 600, marginTop: 'auto' }}>
                  KES {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="checkout-section">
          <h3>ORDER SUMMARY</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            {cart.map(item => (
              <div key={item.id} className="order-detail-row">
                <span className="label">{item.name} × {item.quantity}</span>
                <span>KES {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          
          <div>
            <div className="order-detail-row">
              <span className="label">Subtotal</span>
              <span>KES {cartTotal.subtotal?.toLocaleString() || 0}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Delivery</span>
              <span>KES {deliveryFee.toLocaleString()}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Tax (16%)</span>
              <span>KES {cartTotal.tax?.toLocaleString() || 0}</span>
            </div>
            <div className="order-detail-row" style={{ borderTop: '2px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.75rem' }}>
              <span className="label" style={{ fontSize: '1.1rem' }}>TOTAL</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-sage)' }}>
                KES {cartTotal.total?.toLocaleString() || 0}
              </span>
            </div>
          </div>
          
          <button 
            className="payment-button"
            onClick={onCheckout}
            style={{ marginTop: '1.5rem' }}
          >
            Proceed to Checkout
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
            ⏱️ 15-20 min delivery
          </p>
        </div>
      </div>
    </div>
  )
}

export default Cart

