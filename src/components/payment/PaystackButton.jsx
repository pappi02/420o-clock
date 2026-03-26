// Paystack Payment Button Component
// No Backend Required - Client-side payment processing!

import { usePaystackPayment } from 'react-paystack'

const PaystackButton = ({ 
  email, 
  amount, 
  onSuccess, 
  onClose, 
  orderData,
  children 
}) => {
  // Get Paystack public key from environment variables
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ''

  // Configuration for Paystack
  const config = {
    reference: `420_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
    email: email,
    amount: amount * 100, // Convert to kobo (KES cents)
    currency: 'KES',
    publicKey: publicKey,
    metadata: {
      orderId: orderData?.orderId || 'N/A',
      customerName: orderData?.customerName || '',
      customerPhone: orderData?.phone || '',
      orderItems: orderData?.items?.map(item => item.name).join(', ') || ''
    },
    custom_fields: [
      {
        display_name: 'Order ID',
        variable_name: 'order_id',
        value: orderData?.orderId || 'N/A'
      },
      {
        display_name: 'Customer',
        variable_name: 'customer_name',
        value: orderData?.customerName || ''
      }
    ]
  }

  // Initialize Paystack payment
  const initializePayment = usePaystackPayment(config)

  // Handle successful payment
  const handleSuccess = (reference) => {
    console.log('Payment successful:', reference)
    
    // Call the onSuccess callback with payment reference
    if (onSuccess) {
      onSuccess({
        reference: reference.reference,
        status: reference.status,
        amount: reference.amount,
        transaction: reference.transaction
      })
    }
  }

  // Handle payment closure
  const handleClose = () => {
    console.log('Payment closed')
    if (onClose) {
      onClose()
    }
  }

  // If no public key is configured, show warning
  if (!publicKey) {
    return (
      <button 
        className="payment-button disabled"
        disabled
        title="Paystack not configured"
      >
        ⚠️ Payment Not Available
      </button>
    )
  }

  return (
    <button 
      className="payment-button"
      onClick={() => initializePayment(handleSuccess, handleClose)}
    >
      {children || (
        <>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          Pay KES {amount.toLocaleString()}
        </>
      )}
    </button>
  )
}

export default PaystackButton

