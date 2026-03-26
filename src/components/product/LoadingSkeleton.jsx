import './LoadingSkeleton.css'

const LoadingSkeleton = () => {
  return (
    <div className="product-detail-skeleton">
      <div className="skeleton-container">
        <div className="skeleton-image-column">
          <div className="skeleton-main-image shimmer" />
          <div className="skeleton-thumbnails">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`skeleton-thumbnail shimmer`} />
            ))}
          </div>
        </div>
        
        <div className="skeleton-info-column">
          <div className="skeleton-breadcrumb shimmer" />
          <div className="skeleton-title shimmer" />
          <div className="skeleton-type shimmer" />
          <div className="skeleton-rating shimmer" />
          <div className="skeleton-grow-info shimmer" />
          <div className="skeleton-description shimmer" />
          <div className="skeleton-description short shimmer" />
          
          <div className="skeleton-price-section">
            <div className="skeleton-price shimmer" />
          </div>
          
          <div className="skeleton-quantity shimmer" />
          
          <div className="skeleton-button shimmer" />
          <div className="skeleton-button secondary shimmer" />
          
          <div className="skeleton-delivery shimmer" />
        </div>
      </div>
    </div>
  )
}

export default LoadingSkeleton

