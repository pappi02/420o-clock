import { useState, useEffect } from 'react'
import { products } from '../data/products'
import ProductImageGallery from '../components/product/ProductImageGallery'
import ProductInfo from '../components/product/ProductInfo'
import ProductActions from '../components/product/ProductActions'
import ProductTabs from '../components/product/ProductTabs'
import RelatedProducts from '../components/product/RelatedProducts'
import LoadingSkeleton from '../components/product/LoadingSkeleton'
import './ProductDetail.css'

const ProductDetail = ({ productId, onBack, onProductClick }) => {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    // Simulate loading delay for demo
    setLoading(true)
    const timer = setTimeout(() => {
      const foundProduct = products.find(p => p.id === productId)
      setProduct(foundProduct || null)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [productId])

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [productId])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <button className="back-btn" onClick={onBack}>
          ← Back to Shop
        </button>
      </div>
    )
  }

  return (
    <div className="product-detail-page">
      {/* Back Button */}
      <button className="back-button" onClick={onBack}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Shop
      </button>

      <div className="product-detail-container">
        {/* Left Column - Images */}
        <div className="product-images-column">
          <ProductImageGallery 
            product={product}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
          />
        </div>

        {/* Right Column - Info & Actions */}
        <div className="product-info-column">
          <ProductInfo product={product} />
          <ProductActions product={product} />
        </div>
      </div>

      {/* Tabs Section */}
      <ProductTabs product={product} />

      {/* Related Products */}
      <RelatedProducts 
        currentProductId={product.id}
        category={product.category}
        onProductClick={onProductClick}
      />
    </div>
  )
}

export default ProductDetail

