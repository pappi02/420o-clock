import './DriverCard.css'

function DriverCard({ 
  driver = {
    name: 'Michael K.',
    rating: 4.9,
    deliveries: 128,
    vehicle: 'Toyota Corolla',
    color: 'Blue',
    plate: 'ABC-123-XY',
    phone: '+254700000000'
  },
  compact = false
}) {
  const generateWhatsAppLink = () => {
    const phoneNumber = driver.phone.replace(/\D/g, '')
    const message = `Hi! I'm waiting for my order delivery.`
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  }
  
  const generateCallLink = () => {
    return `tel:${driver.phone}`
  }
  
  if (compact) {
    return (
      <div className="driver-card compact">
        <div className="driver-avatar">
          {driver.name.charAt(0)}
        </div>
        <div className="driver-info">
          <span className="driver-name">{driver.name}</span>
          <span className="driver-rating">⭐ {driver.rating} • {driver.deliveries} deliveries</span>
        </div>
        <div className="driver-actions compact">
          <a href={generateCallLink()} className="driver-action-btn call">
            📞
          </a>
          <a href={generateWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="driver-action-btn whatsapp">
            💬
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <div className="driver-card">
      <div className="driver-card-header">
        <h4>🚚 YOUR DRIVER</h4>
        <span className="">On the waydriver-status</span>
      </div>
      
      <div className="driver-main">
        <div className="driver-avatar-large">
          {driver.name.charAt(0)}
        </div>
        
        <div className="driver-details">
          <h5 className="driver-name">{driver.name}</h5>
          
          <div className="driver-rating">
            <span className="rating-star">⭐</span>
            <span className="rating-value">{driver.rating}</span>
            <span className="rating-count">({driver.deliveries} deliveries)</span>
          </div>
          
          <div className="driver-vehicle">
            <span>{driver.vehicle}</span>
            <span className="vehicle-divider">•</span>
            <span>{driver.color}</span>
            <span className="vehicle-divider">•</span>
            <span>{driver.plate}</span>
          </div>
        </div>
      </div>
      
      <div className="driver-actions">
        <a 
          href={generateCallLink()} 
          className="driver-action-btn call"
        >
          <span className="btn-icon">📞</span>
          <span className="btn-text">Call</span>
        </a>
        
        <a 
          href={generateWhatsAppLink()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="driver-action-btn whatsapp"
        >
          <span className="btn-icon">💬</span>
          <span className="btn-text">WhatsApp</span>
        </a>
      </div>
    </div>
  )
}

export default DriverCard

