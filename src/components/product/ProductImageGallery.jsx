import { useState } from 'react'
import './ProductImageGallery.css'

const ProductImageGallery = ({ product, selectedImage, onSelectImage }) => {
  const [zoom, setZoom] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Use placeholder images based on product id for demo
  const images = [
    `/images/products/product-${product.id}.jpg`,
    `/images/products/product-${product.id}-2.jpg`,
    `/images/products/product-${product.id}-3.jpg`,
    `/images/products/product-${product.id}-4.jpg`
  ]

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect()
    const x = ((e.pageX - left) / width) * 100
    const y = ((e.pageY - top) / height) * 100
    setMousePosition({ x, y })
  }

  return (
    <div className="product-image-gallery">
      {/* Main Image */}
      <div 
        className={`product-main-image ${zoom ? 'zoomed' : ''}`}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
      >
        <div className="product-image-placeholder">
          <span className="product-emoji-large">🌿</span>
        </div>
        
        {/* Badges */}
        {product.bestseller && (
          <span className="product-badge bestseller">Bestseller</span>
        )}
        {product.discount && (
          <span className="product-badge discount">-{product.discount}%</span>
        )}
      </div>

      {/* Thumbnails */}
      <div className="product-thumbnails">
        {images.map((img, index) => (
          <button
            key={index}
            className={`product-thumbnail ${selectedImage === index ? 'active' : ''}`}
            onClick={() => onSelectImage(index)}
          >
            <span className="thumbnail-emoji">🌿</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProductImageGallery

