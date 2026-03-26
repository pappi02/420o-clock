// OrderList Component - Updated with Firestore Integration
// No Backend Required - Real-time updates!

import { useState, useEffect } from 'react'
import { useOrders } from '../../context/OrdersContext'
import './Orders.css'

function OrderList({ onViewOrder }) {
  const { orders, loading, useFirestore, subscribeToOrders } = useOrders()
  const [localOrders, setLocalOrders] = useState([])

  // Load orders on mount
  useEffect(() => {
    // Subscribe to orders (will use Firestore if configured, otherwise localStorage)
    const unsubscribe = subscribeToOrders(null)
    
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  // Also load from localStorage as backup
  useEffect(() => {
    const savedOrders = localStorage.getItem('420oclock-orders')
    if (savedOrders) {
      setLocalOrders(JSON.parse(savedOrders))
    }
  }, [])

  // Use orders from context if available, otherwise localStorage
  const displayOrders = orders.length > 0 ? orders : localOrders

  const getStatusLabel = (status) => {
    const labels = {
      awaiting_location: 'Awaiting Location',
      processing: 'Processing',
      preparing: 'Preparing',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }
    return labels[status] || status
  }

  const getStatusIcon = (status) => {
    const icons = {
      awaiting_location: '⏳',
      processing: '🔄',
      preparing: '👨‍🍳',
      out_for_delivery: '🚚',
      delivered: '✅',
      cancelled: '❌'
    }
    return icons[status] || '📦'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const generateWhatsAppLink = (order) => {
    const phoneNumber = '254700000000'
    const message = `Hi! I need help with my order #${order.id}`
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  }

  if (loading) {
    return (
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
        </div>
        <p>Loading orders...</p>
      </div>
    )
  }

  if (displayOrders.length === 0) {
    return (
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
        </div>
        <div className="orders-empty">
          <h2>No orders yet</h2>
          <p>Once you place an order, it will appear here.</p>
          
          {useFirestore && (
            <div className="firestore-badge">
              <span>🔥 Firestore Connected</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>My Orders</h1>
        
        {useFirestore && (
          <div className="firestore-status">
            <span className="firestore-indicator"></span>
            <span>Real-time synced</span>
          </div>
        )}
      </div>
      
      <div className="orders-list">
        {displayOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <h3>Order #{order.id}</h3>
              <span className="order-date">{formatDate(order.createdAt)}</span>
            </div>
            
            <div className="order-card-body">
              <div className="order-items">
                {order.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="order-item-image">🌿</div>
                    <div className="order-item-details">
                      <h4>{item.name}</h4>
                      <p>Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-summary">
                <div className="total">KES {order.totals?.total?.toLocaleString() || 0}</div>
                <span className={`order-status ${order.status}`}>
                  {getStatusIcon(order.status)} {getStatusLabel(order.status)}
                </span>
              </div>
            </div>
            
            {/* Show scheduled delivery if available */}
            {order.deliverySchedule && (
              <div className="order-scheduled-delivery">
                <span className="schedule-icon">⏰</span>
                <span className="schedule-text">
                  {order.deliverySchedule.isPremium && '🌅 '}
                  {order.deliverySchedule.window} - {order.deliverySchedule.date}
                </span>
              </div>
            )}
            
            <div className="order-card-actions">
              <button 
                className="order-action-btn primary"
                onClick={() => onViewOrder?.(order)}
              >
                Track Order
              </button>
              
              {order.status === 'awaiting_location' && (
                <a 
                  href={generateWhatsAppLink(order)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="order-action-btn whatsapp"
                >
                  📱 Share Location
                </a>
              )}
              
              <button className="order-action-btn secondary">
                Need Help?
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderList

