// Checkout Component - Updated with Firebase + Paystack Integration
// No Backend Required - All Client-Side!

import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useSchedule } from '../../context/ScheduleContext'
import SchedulePicker from '../delivery/SchedulePicker'
import PaystackButton from '../payment/PaystackButton'
import { useOrders } from '../../context/OrdersContext'
import { isFirebaseConfigured } from '../../firebase/services'
import './Checkout.css'

function Checkout({ onBack, onPaymentSuccess }) {
  const { cart, cartTotal, deliveryFee, taxRate } = useCart()
  const { selectedWindow, getScheduleSummary, getCurrentDeliveryFee, isScheduleComplete } = useSchedule()
  const { addOrder, completePayment } = useOrders()
  
  const [step, setStep] = useState('details') // details, schedule, payment, success
  const [deliveryMethod, setDeliveryMethod] = useState('whatsapp')
  const [isProcessing, setIsProcessing] = useState(false)
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [firebaseConfigured, setFirebaseConfigured] = useState(false)
  const [orderId, setOrderId] = useState(null)
  
  // Check if Firebase is configured
  useEffect(() => {
    setFirebaseConfigured(isFirebaseConfigured())
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setContactInfo(prev => ({ ...prev, [name]: value }))
  }

  const isFormValid = () => {
    return contactInfo.name && contactInfo.email && contactInfo.phone
  }

  const handleContinueToSchedule = () => {
    if (isFormValid()) {
      setStep('schedule')
    }
  }

  const handleScheduleSelect = (schedule) => {
    setStep('payment')
  }

  // Calculate final totals
  const getFinalTotals = () => {
    const scheduledDeliveryFee = isScheduleComplete() ? getCurrentDeliveryFee() : deliveryFee
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * taxRate
    const total = subtotal + scheduledDeliveryFee + tax
    return { subtotal, delivery: scheduledDeliveryFee, tax, total }
  }

  // Handle Paystack payment success
  const handlePaymentSuccess = async (payment) => {
    setIsProcessing(true)
    
    try {
      const finalTotals = getFinalTotals()
      const schedule = getScheduleSummary()
      
      // Create order data
      const orderData = {
        id: orderId,
        customer: contactInfo,
        items: cart,
        totals: finalTotals,
        deliveryMethod,
        deliverySchedule: schedule,
        delivery: {
          method: deliveryMethod,
          address: contactInfo.address,
          scheduledDate: schedule?.date,
          scheduledWindow: schedule?.window
        },
        status: 'awaiting_location',
        paymentStatus: 'paid',
        paymentReference: payment.reference,
        createdAt: new Date().toISOString(),
        timeline: {
          order_placed: new Date().toISOString(),
          payment_confirmed: new Date().toISOString()
        }
      }
      
      // If Firebase is configured, save to Firestore
      if (firebaseConfigured && orderId) {
        await completePayment(orderId, payment.reference)
      }
      
      // Also save to localStorage as backup
      const orders = JSON.parse(localStorage.getItem('420oclock-orders') || '[]')
      orders.unshift(orderData)
      localStorage.setItem('420oclock-orders', JSON.stringify(orders))
      
      // Store order ID for WhatsApp reference
      localStorage.setItem('lastOrderId', orderId)
      
      setStep('success')
      onPaymentSuccess?.(orderData)
      
    } catch (error) {
      console.error('Error processing order:', error)
      // Still show success even if Firestore fails
      setStep('success')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle demo payment (when Paystack is not configured)
  const handleDemoPayment = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const orderNumber = `420-${Math.floor(1000 + Math.random() * 9000)}`
    setOrderId(orderNumber)
    
    const finalTotals = getFinalTotals()
    const schedule = getScheduleSummary()
    
    // Create order object
    const orderData = {
      id: orderNumber,
      customer: contactInfo,
      items: cart,
      totals: finalTotals,
      deliveryMethod,
      deliverySchedule: schedule,
      delivery: {
        method: deliveryMethod,
        address: contactInfo.address,
        scheduledDate: schedule?.date,
        scheduledWindow: schedule?.window
      },
      status: 'awaiting_location',
      paymentStatus: 'paid',
      paymentReference: `demo_${Date.now()}`,
      createdAt: new Date().toISOString(),
      timeline: {
        order_placed: new Date().toISOString()
      }
    }
    
    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('420oclock-orders') || '[]')
    orders.unshift(orderData)
    localStorage.setItem('420oclock-orders', JSON.stringify(orders))
    
    // Store order ID for WhatsApp reference
    localStorage.setItem('lastOrderId', orderNumber)
    
    setIsProcessing(false)
    setStep('success')
    onPaymentSuccess?.(orderData)
  }

  // Generate order ID when entering payment step
  useEffect(() => {
    if (step === 'payment' && !orderId) {
      setOrderId(`420-${Math.floor(1000 + Math.random() * 9000)}`)
    }
  }, [step])

  const generateWhatsAppLink = () => {
    const phoneNumber = '254700000000' // Replace with actual number
    const message = `Hi! I just placed order #${orderId || localStorage.getItem('lastOrderId') || '420-XXXX'}. Here is my delivery location.`
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  }

  // Success Step
  if (step === 'success') {
    const orderNumber = orderId || '420-XXXX'
    const schedule = getScheduleSummary()
    
    return (
      <div className="checkout-container">
        <div className="payment-success">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          
          <h2>Payment Successful!</h2>
          <p className="order-number">Thank you for your order #{orderNumber}</p>
          
          {schedule && (
            <div className="scheduled-delivery-notice">
              <span className="schedule-notice-icon">⏰</span>
              <div className="schedule-notice-content">
                <span className="schedule-notice-label">Scheduled Delivery</span>
                <span className="schedule-notice-value">
                  {schedule.isPremium && '🌅 '}{schedule.window} - {schedule.date}, {schedule.dateFull}
                </span>
              </div>
            </div>
          )}
          
          {firebaseConfigured && (
            <div className="firebase-notice">
              <span className="firebase-icon">🔥</span>
              <span>Your order is saved to the cloud</span>
            </div>
          )}
          
          <div className="whatsapp-share-section">
            <h3>📍 Share Your Delivery Location</h3>
            <ol>
              <li>Click the WhatsApp button below</li>
              <li>You'll connect with our delivery bot</li>
              <li>Share your live location (tap 📎 → Location)</li>
              <li>Driver will get your precise spot!</li>
            </ol>
            
            <a 
              href={generateWhatsAppLink()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="whatsapp-button"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share Location via WhatsApp
            </a>
            
            <p className="location-timer">
              ⏱️ Location must be shared within <span>30 minutes</span> or your order may be delayed
            </p>
          </div>
          
          <div className="order-details-card">
            <h4>Order Details</h4>
            <div className="order-detail-row">
              <span className="label">Order #{orderNumber}</span>
              <span className="value">{cart.length} items</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Delivery</span>
              <span className="value">
                {schedule ? `${schedule.window} (Scheduled)` : 'Standard'}
              </span>
            </div>
            <div className="order-detail-row">
              <span className="label">Total</span>
              <span className="value">KES {getFinalTotals().total.toLocaleString()}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Status</span>
              <span className="order-status">⏳ Awaiting Location</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Schedule Step
  if (step === 'schedule') {
    const finalTotals = getFinalTotals()
    
    return (
      <div className="checkout-container">
        <div className="checkout-header">
          <button onClick={() => setStep('details')} className="back-button" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <h1 className="checkout-title">SCHEDULE DELIVERY</h1>
          <div style={{ width: '100px' }}></div>
        </div>

        <div className="checkout-grid">
          <div className="checkout-form">
            <SchedulePicker onScheduleSelect={handleScheduleSelect} />
          </div>

          <div className="checkout-section">
            <h3>ORDER SUMMARY</h3>
            
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontWeight: 500 }}>{item.name}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}> × {item.quantity}</span>
                </div>
                <span>KES {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            
            <div style={{ marginTop: '1rem' }}>
              <div className="order-detail-row">
                <span className="label">Subtotal</span>
                <span>KES {finalTotals.subtotal.toLocaleString()}</span>
              </div>
              <div className="order-detail-row">
                <span className="label">Delivery</span>
                <span>KES {finalTotals.delivery.toLocaleString()}</span>
              </div>
              <div className="order-detail-row">
                <span className="label">Tax (16%)</span>
                <span>KES {finalTotals.tax.toLocaleString()}</span>
              </div>
              <div className="order-detail-row" style={{ borderTop: '2px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.75rem' }}>
                <span className="label" style={{ fontSize: '1.1rem' }}>TOTAL</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-sage)' }}>
                  KES {finalTotals.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Payment Step
  if (step === 'payment') {
    const finalTotals = getFinalTotals()
    const schedule = getScheduleSummary()
    
    return (
      <div className="checkout-container">
        <div className="checkout-header">
          <button onClick={() => setStep('schedule')} className="back-button" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Schedule
          </button>
          <h1 className="checkout-title">PAYMENT</h1>
          <div style={{ width: '100px' }}></div>
        </div>

        <div className="checkout-grid">
          <div className="checkout-form">
            {/* Delivery Details Section */}
            <div className="checkout-section">
              <h3>DELIVERY DETAILS</h3>
              
              <div className="contact-summary">
                <div className="summary-item">
                  <span className="summary-label">Name</span>
                  <span className="summary-value">{contactInfo.name}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Phone</span>
                  <span className="summary-value">{contactInfo.phone}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Email</span>
                  <span className="summary-value">{contactInfo.email}</span>
                </div>
              </div>
              
              {schedule && (
                <div className="schedule-summary-card">
                  <div className="schedule-card-header">
                    <span className="schedule-icon">⏰</span>
                    <span className="schedule-label">Scheduled Delivery</span>
                    {schedule.isPremium && <span className="golden-badge">🌅 GOLDEN HOUR</span>}
                  </div>
                  <div className="schedule-card-body">
                    <span className="schedule-window">{schedule.window}</span>
                    <span className="schedule-time">{schedule.time}</span>
                    <span className="schedule-date">{schedule.date}, {schedule.dateFull}</span>
                  </div>
                </div>
              )}
              
              <div className="delivery-method-section">
                <h4>Location Sharing</h4>
                <div className="delivery-methods">
                  <label 
                    className={`delivery-method ${deliveryMethod === 'whatsapp' ? 'selected' : ''}`}
                    onClick={() => setDeliveryMethod('whatsapp')}
                  >
                    <input 
                      type="radio" 
                      name="delivery" 
                      checked={deliveryMethod === 'whatsapp'}
                      onChange={() => setDeliveryMethod('whatsapp')}
                    />
                    <div className="delivery-method-content">
                      <h4>📱 WhatsApp Location</h4>
                      <p>Share live location via WhatsApp after payment</p>
                    </div>
                  </label>
                  
                  <label 
                    className={`delivery-method ${deliveryMethod === 'manual' ? 'selected' : ''}`}
                    onClick={() => setDeliveryMethod('manual')}
                  >
                    <input 
                      type="radio" 
                      name="delivery" 
                      checked={deliveryMethod === 'manual'}
                      onChange={() => setDeliveryMethod('manual')}
                    />
                    <div className="delivery-method-content">
                      <h4>📍 Manual Address</h4>
                      <p>Type in your delivery address</p>
                    </div>
                  </label>
                </div>
                
                {deliveryMethod === 'manual' && (
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Delivery Address</label>
                    <textarea
                      name="address"
                      value={contactInfo.address}
                      onChange={handleInputChange}
                      placeholder="Enter your full delivery address..."
                      rows="3"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h3>ORDER SUMMARY</h3>
            
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontWeight: 500 }}>{item.name}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}> × {item.quantity}</span>
                </div>
                <span>KES {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            
            <div style={{ marginTop: '1rem' }}>
              <div className="order-detail-row">
                <span className="label">Subtotal</span>
                <span>KES {finalTotals.subtotal.toLocaleString()}</span>
              </div>
              <div className="order-detail-row">
                <span className="label">Delivery {schedule && `(${schedule.window})`}</span>
                <span>KES {finalTotals.delivery.toLocaleString()}</span>
              </div>
              <div className="order-detail-row">
                <span className="label">Tax (16%)</span>
                <span>KES {finalTotals.tax.toLocaleString()}</span>
              </div>
              <div className="order-detail-row" style={{ borderTop: '2px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.75rem' }}>
                <span className="label" style={{ fontSize: '1.1rem' }}>TOTAL</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-sage)' }}>
                  KES {finalTotals.total.toLocaleString()}
                </span>
              </div>
            </div>
            
            {/* Paystack Payment Button */}
            <div style={{ marginTop: '1.5rem' }}>
              {firebaseConfigured ? (
                <PaystackButton
                  email={contactInfo.email}
                  amount={finalTotals.total}
                  onSuccess={handlePaymentSuccess}
                  onClose={() => setIsProcessing(false)}
                  orderData={{
                    orderId: orderId,
                    customerName: contactInfo.name,
                    phone: contactInfo.phone,
                    items: cart
                  }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Pay KES {finalTotals.total.toLocaleString()}
                </PaystackButton>
              ) : (
                <button 
                  className="payment-button"
                  onClick={handleDemoPayment}
                  disabled={!isFormValid() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      Pay KES {finalTotals.total.toLocaleString()}
                    </>
                  )}
                </button>
              )}
              
              {!firebaseConfigured && (
                <p className="demo-notice">
                  ⚠️ Demo Mode: Add Firebase credentials to enable real payments
                </p>
              )}
            </div>
            
            <div className="payment-methods">
              <span className="payment-method-badge">💳 Card</span>
              <span className="payment-method-badge">📱 USSD</span>
              <span className="payment-method-badge">🏦 Bank</span>
              <span className="payment-method-badge">📱 M-Pesa</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Initial Details Step
  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button onClick={onBack} className="back-button" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Cart
        </button>
        <h1 className="checkout-title">CHECKOUT</h1>
        <div style={{ width: '100px' }}></div>
      </div>

      <div className="checkout-grid">
        <div className="checkout-form">
          {/* Contact Information */}
          <div className="checkout-section">
            <h3>CONTACT INFORMATION</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={contactInfo.name}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={contactInfo.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={contactInfo.phone}
                onChange={handleInputChange}
                placeholder="+254 700 000 000"
              />
            </div>
          </div>

          {/* Quick Continue Button */}
          <button 
            className="continue-button"
            onClick={handleContinueToSchedule}
            disabled={!isFormValid()}
          >
            Continue to Schedule Delivery
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* Order Summary */}
        <div className="checkout-section">
          <h3>ORDER SUMMARY</h3>
          
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontWeight: 500 }}>{item.name}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}> × {item.quantity}</span>
              </div>
              <span>KES {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          
          <div style={{ marginTop: '1rem' }}>
            <div className="order-detail-row">
              <span className="label">Subtotal</span>
              <span>KES {cartTotal.subtotal?.toLocaleString() || 0}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Delivery</span>
              <span>KES {deliveryFee.toLocaleString()}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Tax (16%)</span>
              <span>KES {cartTotal.tax?.toLocaleString() || 0}</span>
            </div>
            <div className="order-detail-row" style={{ borderTop: '2px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.75rem' }}>
              <span className="label" style={{ fontSize: '1.1rem' }}>TOTAL</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-sage)' }}>
                KES {cartTotal.total?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

