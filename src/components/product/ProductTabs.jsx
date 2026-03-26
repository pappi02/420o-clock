import { useState } from 'react'
import './ProductTabs.css'

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState('about')

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'effects', label: 'Effects' },
    { id: 'terpenes', label: 'Terpenes' },
    { id: 'reviews', label: `Reviews (${product.reviewCount || 0})` }
  ]

  // Sample terpenes data based on product
  const terpenesData = product.terpenes || ['Myrcene', 'Limonene', 'Caryophyllene']
  const terpeneDescriptions = {
    'Myrcene': 'Earthy, mango-like, sedating',
    'Limonene': 'Citrus, uplifting, stress-relief',
    'Caryophyllene': 'Spicy, pepper, anti-inflammatory',
    'Pinene': 'Pine, focus, memory',
    'Terpinolene': 'Floral, herbal, sedative'
  }

  // Sample reviews
  const sampleReviews = [
    {
      id: 1,
      user: 'Michael T.',
      date: 'Feb 28, 2026',
      rating: 5,
      text: 'Amazing quality! This is my go-to strain. Perfect for daytime use without feeling too heavy.'
    },
    {
      id: 2,
      user: 'Sarah L.',
      date: 'Feb 15, 2026',
      rating: 5,
      text: 'Great product, exactly as described. Fast delivery too!'
    },
    {
      id: 3,
      user: 'James K.',
      date: 'Feb 10, 2026',
      rating: 4,
      text: 'Really good quality, will definitely order again. The effects last a while.'
    }
  ]

  return (
    <div className="product-tabs">
      {/* Tab Headers */}
      <div className="tab-headers">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-header ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'about' && (
          <div className="tab-about">
            <p className="about-description">{product.description}</p>
            
            <div className="about-details">
              <div className="detail-row">
                <span className="detail-label">Brand</span>
                <span className="detail-value">{product.brand}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type</span>
                <span className="detail-value">{product.type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Category</span>
                <span className="detail-value">{product.category}</span>
              </div>
            </div>

            {/* Lab Results COA Section */}
            <div className="coa-section">
              <h4 className="coa-title">Lab Results (COA)</h4>
              <div className="coa-grid">
                <div className="coa-item">
                  <span className="coa-label">THC</span>
                  <span className="coa-value">{product.thc}</span>
                </div>
                <div className="coa-item">
                  <span className="coa-label">CBD</span>
                  <span className="coa-value">{product.cbd}</span>
                </div>
                <div className="coa-item">
                  <span className="coa-label">Category</span>
                  <span className="coa-value">{product.category}</span>
                </div>
                <div className="coa-item">
                  <span className="coa-label">Source</span>
                  <span className="coa-value">Premium</span>
                </div>
              </div>
              <button className="view-coa-btn">
                View Full Certificate ↗
              </button>
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="tab-effects">
            <div className="effects-tags">
              {product.effects?.map((effect, index) => (
                <div key={index} className="effect-tag">
                  {effect.charAt(0).toUpperCase() + effect.slice(1)}
                </div>
              ))}
            </div>
            
            <div className="feelings-section">
              <h4>Users report feeling:</h4>
              <div className="feeling-bars">
                <div className="feeling">
                  <span className="feeling-label">Relaxed</span>
                  <div className="feeling-bar">
                    <div className="feeling-bar-fill" style={{ width: '90%' }} />
                  </div>
                </div>
                <div className="feeling">
                  <span className="feeling-label">Happy</span>
                  <div className="feeling-bar">
                    <div className="feeling-bar-fill" style={{ width: '85%' }} />
                  </div>
                </div>
                <div className="feeling">
                  <span className="feeling-label">Euphoric</span>
                  <div className="feeling-bar">
                    <div className="feeling-bar-fill" style={{ width: '70%' }} />
                  </div>
                </div>
                <div className="feeling">
                  <span className="feeling-label">Creative</span>
                  <div className="feeling-bar">
                    <div className="feeling-bar-fill" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'terpenes' && (
          <div className="tab-terpenes">
            <div className="terpene-list">
              {terpenesData.map((terpene, index) => (
                <div key={index} className="terpene-item">
                  <div className="terpene-header">
                    <span className="terpene-name">{terpene}</span>
                    <span className="terpene-percent">
                      {index === 0 ? '0.8%' : index === 1 ? '0.4%' : '0.3%'}
                    </span>
                  </div>
                  <div className="terpene-bar">
                    <div 
                      className="terpene-bar-fill" 
                      style={{ width: `${(index === 0 ? 80 : index === 1 ? 40 : 30)}%` }}
                    />
                  </div>
                  <p className="terpene-desc">{terpeneDescriptions[terpene] || 'Aromatic compound'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="tab-reviews">
            {/* Review Summary */}
            <div className="review-summary">
              <div className="average-rating">
                <span className="big-rating">{product.rating}</span>
                <div className="rating-stars">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={i <= product.rating ? 'star-filled' : 'star-empty'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="total-reviews">{product.reviewCount} reviews</span>
              </div>
              
              <button className="write-review-btn">
                Write a Review
              </button>
            </div>

            {/* Review List */}
            <div className="review-list">
              {sampleReviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">{review.user}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <div className="review-stars">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={i <= review.rating ? 'star-filled' : 'star-empty'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="review-text">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductTabs

