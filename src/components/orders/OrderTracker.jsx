import { useState, useEffect } from 'react'
import LiveMap from '../tracking/LiveMap'
import ETAIndicator from '../tracking/ETAIndicator'
import DeliveryTimeline from '../tracking/DeliveryTimeline'
import DriverCard from '../tracking/DriverCard'
import { getStatusInfo } from '../../utils/deliveryUtils'
import './Orders.css'

function OrderTracker({ order, onBack }) {
  const [driverLocation, setDriverLocation] = useState(null)
  const [eta, setEta] = useState(8)
  const [isSimulating, setIsSimulating] = useState(false)
  
  // Simulate real-time updates for demo
  useEffect(() => {
    if (order?.status === 'out_for_delivery' || order?.status === 'nearby') {
      setIsSimulating(true)
      
      const interval = setInterval(() => {
        setEta(prev => Math.max(0, prev - 1))
        
        // Update driver location
        setDriverLocation(prev => {
          if (!prev) {
            return { lat: -1.2950, lng: 36.8300 }
          }
          // Move closer to user (simulated Nairobi location)
          return {
            lat: prev.lat + 0.0001,
            lng: prev.lng - 0.0001
          }
        })
      }, 30000) // Update every 30 seconds
      
      return () => {
        clearInterval(interval)
        setIsSimulating(false)
      }
    }
  }, [order?.status])
  
  const getStatusLabel = (status) => {
    const statusInfo = getStatusInfo(status)
    return statusInfo.label
  }

  const generateWhatsAppLink = () => {
    const phoneNumber = '254700000000'
    const message = `Hi! I need help with my order #${order?.id}`
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  }
  
  // Get scheduled delivery info if available
  const scheduledDelivery = order?.deliverySchedule
  const statusInfo = order ? getStatusInfo(order.status) : null

  if (!order) {
    return (
      <div className="order-tracker">
        <p>Order not found</p>
      </div>
    )
  }

  return (
    <div className="order-tracker">
      <div className="order-tracker-header">
        <button 
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          My Orders
        </button>
        <h2>Order #{order.id}</h2>
        <div></div>
      </div>

      {/* Scheduled Delivery Banner */}
      {scheduledDelivery && (
        <div className="scheduled-delivery-banner">
          <span className="banner-icon">⏰</span>
          <div className="banner-content">
            <span className="banner-label">Scheduled Delivery</span>
            <span className="banner-value">
              {scheduledDelivery.isPremium && '🌅 '}
              {scheduledDelivery.window} - {scheduledDelivery.date}, {scheduledDelivery.dateFull}
            </span>
          </div>
        </div>
      )}

      {/* Live Map */}
      <div className="tracking-map-container">
        <LiveMap 
          driverLocation={driverLocation}
          orderId={order.id}
          isExpanded={false}
        />
      </div>

      {/* ETA Indicator */}
      {(order.status === 'out_for_delivery' || order.status === 'nearby') && (
        <div className="eta-section">
          <ETAIndicator 
            minutes={eta} 
            distance={`${(eta * 0.3).toFixed(1)} km`}
          />
        </div>
      )}

      {/* Driver Info */}
      {order.status === 'out_for_delivery' && (
        <DriverCard />
      )}

      {/* Order Status Banner */}
      <div className="order-status-banner" style={{ backgroundColor: statusInfo?.bgColor }}>
        <span className="status-icon">{statusInfo?.icon}</span>
        <span className="status-label" style={{ color: statusInfo?.color }}>
          {getStatusLabel(order.status)}
        </span>
        {order.status === 'out_for_delivery' && (
          <span className="eta-text">
            Arriving in ~{eta} minutes
          </span>
        )}
      </div>

      {/* Order Details */}
      <div className="order-details-section">
        <h3>Order Details</h3>
        <div className="order-detail-row">
          <span className="label">Items</span>
          <span className="value">{order.items?.length || 0} items</span>
        </div>
        <div className="order-detail-row">
          <span className="label">Total</span>
          <span className="value">KES {order.totals?.total?.toLocaleString() || 0}</span>
        </div>
        {scheduledDelivery && (
          <div className="order-detail-row">
            <span className="label">Delivery</span>
            <span className="value">
              {scheduledDelivery.isPremium ? '🌅 Golden Hour' : scheduledDelivery.window}
            </span>
          </div>
        )}
        <div className="order-detail-row">
          <span className="label">Status</span>
          <span className={`order-status ${order.status}`}>
            {statusInfo?.icon} {getStatusLabel(order.status)}
          </span>
        </div>
      </div>

      {/* Delivery Timeline */}
      <DeliveryTimeline order={order} />

      {/* Delivery Instructions */}
      {order.customer?.address && (
        <div className="delivery-instructions">
          <h4>📍 Delivery Instructions</h4>
          <p>{order.customer.address}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="tracker-actions">
        <a 
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="order-action-btn whatsapp"
          style={{ textDecoration: 'none' }}
        >
          📞 Contact Support
        </a>
        <button className="order-action-btn secondary" style={{ border: '1px solid #f44336', color: '#f44336' }}>
          🚨 Report Issue
        </button>
      </div>
    </div>
  )
}

export default OrderTracker

