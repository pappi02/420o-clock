import { products } from '../../data/products'
import ProductCard from './ProductCard'
import './RelatedProducts.css'

const RelatedProducts = ({ currentProductId, category, onProductClick }) => {
  // Get related products from same category, excluding current product
  const relatedProducts = products
    .filter(p => p.id !== currentProductId && p.category === category)
    .slice(0, 4)

  // If not enough products in category, add from other categories
  if (relatedProducts.length < 4) {
    const additionalProducts = products
      .filter(p => p.id !== currentProductId && !relatedProducts.find(rp => rp.id === p.id))
      .slice(0, 4 - relatedProducts.length)
    relatedProducts.push(...additionalProducts)
  }

  if (relatedProducts.length === 0) return null

  return (
    <div className="related-products">
      <h2 className="related-title">You May Also Like</h2>
      <div className="related-grid">
        {relatedProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product}
            onQuickView={onProductClick}
          />
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts

