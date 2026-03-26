import ProductCard from './ProductCard'
import './ProductGrid.css'

function ProductGrid({ products, onAddToCart, onQuickView, isLoading, onClearFilters }) {
  if (isLoading) {
    return (
      <div className="product-grid">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="product-skeleton">
            <div className="skeleton-image skeleton" />
            <div className="skeleton-content">
              <div className="skeleton-title skeleton" />
              <div className="skeleton-text skeleton" />
              <div className="skeleton-text skeleton" />
              <div className="skeleton-footer skeleton" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⏰</div>
        <h3 className="empty-state-title">No products found</h3>
        <p className="empty-state-text">
          Try adjusting your filters or check back later
        </p>
        <button className="btn-primary" onClick={onClearFilters}>Clear all filters</button>
      </div>
    )
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <div 
          key={product.id} 
          className="product-grid-item"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <ProductCard 
            product={product}
            onAddToCart={onAddToCart}
            onQuickView={onQuickView}
          />
        </div>
      ))}
    </div>
  )
}

export default ProductGrid

