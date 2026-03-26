import './ProductInfo.css'

const ProductInfo = ({ product }) => {
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'star-filled' : 'star-empty'}>
        ★
      </span>
    ))
  }

  return (
    <div className="product-info">
      {/* Brand & Category */}
      <div className="product-breadcrumbs">
        <span className="breadcrumb-category">{product.category}</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-brand">{product.brand}</span>
      </div>

      {/* Product Name */}
      <h1 className="product-title">{product.name}</h1>

      {/* Type & Potency */}
      <div className="product-type-row">
        <span className={`product-type-badge ${product.type.toLowerCase()}`}>
          {product.type}
        </span>
        <span className="product-potency">
          THC: {product.thc} • CBD: {product.cbd}
        </span>
      </div>

      {/* Rating */}
      <div className="product-rating">
        <div className="product-stars">
          {renderStars(product.rating)}
        </div>
        <span className="product-rating-count">
          {product.rating} ({product.reviewCount} reviews)
        </span>
      </div>

      {/* Grow Info */}
      <div className="product-grow-info">
        <div className="grow-detail">
          <span className="grow-icon">🌱</span>
          <span>Indoor</span>
        </div>
        <div className="grow-detail">
          <span className="grow-icon">🇺🇸</span>
          <span>Premium Source</span>
        </div>
      </div>

      {/* Short Description */}
      <p className="product-short-description">
        {product.description}
      </p>

      {/* Key Benefits */}
      <div className="product-benefits">
        {product.effects?.slice(0, 3).map((effect, i) => (
          <div key={i} className="benefit-item">
            <span className="benefit-check">✓</span> 
            <span className="benefit-text">{effect.charAt(0).toUpperCase() + effect.slice(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductInfo

