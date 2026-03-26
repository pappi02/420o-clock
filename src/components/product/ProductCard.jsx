import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import './ProductCard.css'

function ProductCard({ product, onAddToCart, onQuickView }) {
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const { addToCart } = useCart()

  const handleCardClick = () => {
    onQuickView?.(product)
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (isAdding) return;
    setIsAdding(true)
    setIsAdded(true)
    addToCart(product)
    setTimeout(() => {
      setIsAdding(false)
      setIsAdded(false)
    }, 2000)
  }

  return (
    <div className="product-card" onClick={handleCardClick}>
      {/* Badge & Rating */}
      <div className="product-badges">
        {product.bestseller && <span className="badge badge-gold">Bestseller</span>}
        {product.rating && (
          <span className="badge rating-badge">
            <svg viewBox="0 0 20 20" fill="currentColor" className="star-icon">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {product.rating}
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="product-image-container" onClick={() => onQuickView?.(product)}>
        <div className="product-image" style={{ cursor: 'pointer' }}>
          <span className="product-emoji">🌿</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-type">
          {product.type} • {product.thc} THC
        </p>
        
        <p className="product-description">
          {product.description}
        </p>

        <p className="product-brand">By: {product.brand}</p>

        <div className="product-availability">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="clock-icon-small">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{product.pickupTime}</span>
        </div>

        <div className="product-footer">
          <span className="product-price">KES {product.price.toLocaleString()}</span>
          <button 
            className={`add-to-cart-btn ${isAdding ? 'adding' : ''} ${isAdded ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? 'Adding...' : isAdded ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard

