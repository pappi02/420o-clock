import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import QuantitySelector from './QuantitySelector'
import './ProductActions.css'

const ProductActions = ({ product, onBack }) => {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    if (isAdding) return;
    setIsAdding(true)
    setIsAdded(true)
    addToCart(product, quantity)
    setTimeout(() => {
      setIsAdding(false)
      setIsAdded(false)
    }, 2000)
  }

  const totalPrice = product.price * quantity

  return (
    <div className="product-actions">
      {/* Price */}
      <div className="price-section">
        <div className="price-wrapper">
          <span className="price-currency">KES</span>
          <span className="price-value">{product.price.toLocaleString()}</span>
        </div>
        {product.originalPrice && (
          <span className="original-price">
            KES {product.originalPrice.toLocaleString()}
          </span>
        )}
        <span className="price-each">each</span>
      </div>

      {/* Quantity */}
      <div className="quantity-section">
        <label className="quantity-label">Quantity</label>
        <QuantitySelector 
          value={quantity}
          onChange={setQuantity}
          max={20}
          min={1}
        />
      </div>

      {/* Add to Cart Button */}
      <button 
        className={`add-to-cart-btn-large ${isAdding ? 'adding' : ''} ${isAdded ? 'added' : ''}`}
        onClick={handleAddToCart}
        disabled={isAdding}
      >
        {isAdding ? (
          <span>Adding to Cart...</span>
        ) : isAdded ? (
          <span>✓ Added to Cart!</span>
        ) : (
          <>
            <span className="cart-icon">🛒</span>
            <span>Add to Cart — KES {totalPrice.toLocaleString()}</span>
          </>
        )}
      </button>

      {/* Subscribe Button */}
      <button className="subscribe-btn">
        <span className="subscribe-icon">🔄</span>
        <span>Subscribe & Save 10%</span>
      </button>

      {/* Delivery Info */}
      <div className="delivery-info">
        <div className="delivery-item">
          <span className="delivery-icon">🚚</span>
          <div className="delivery-text">
            <strong>FREE delivery</strong> on orders KES 7,500+
          </div>
        </div>
        <div className="delivery-item">
          <span className="delivery-icon">⏱️</span>
          <div className="delivery-text">
            Order by <strong>2:00 PM</strong> for delivery today
          </div>
        </div>
        <div className="delivery-item">
          <span className="delivery-icon">📍</span>
          <div className="delivery-text">
            <strong>Pickup available</strong> in {product.pickupTime}
          </div>
        </div>
      </div>

      {/* Stock Status */}
      <div className="stock-status in-stock">
        <span className="stock-dot"></span>
        <span>In Stock — Ready to {product.pickupTime ? 'pickup' : 'deliver'}</span>
      </div>
    </div>
  )
}

export default ProductActions

