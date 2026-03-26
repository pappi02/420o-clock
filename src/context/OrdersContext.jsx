// Orders Context - Real-time Firestore Integration
// No Backend Required - All Client-Side!

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { 
  createOrder, 
  getOrder, 
  subscribeToUserOrders, 
  subscribeToOrder,
  updateOrder,
  confirmPayment,
  updateOrderLocation,
  isFirebaseConfigured
} from '../firebase/services'
import { products as staticProducts } from '../data/products'

const OrdersContext = createContext()

export const useOrders = () => {
  const context = useContext(OrdersContext)
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider')
  }
  return context
}

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([])
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useFirestore, setUseFirestore] = useState(false)
  
  // Check if Firebase is configured
  useEffect(() => {
    const configured = isFirebaseConfigured()
    setUseFirestore(configured)
    setLoading(false)
  }, [])
  
  // Subscribe to user orders (real-time)
  const subscribeToOrders = useCallback((userId) => {
    if (!useFirestore || !userId) {
      // Fall back to localStorage
      const savedOrders = localStorage.getItem('420oclock-orders')
      setOrders(savedOrders ? JSON.parse(savedOrders) : [])
      setLoading(false)
      return () => {}
    }

    setLoading(true)
    
    const unsubscribe = subscribeToUserOrders(userId, (firestoreOrders) => {
      setOrders(firestoreOrders)
      setLoading(false)
    })

    return unsubscribe
  }, [useFirestore])

  // Subscribe to specific order (real-time)
  const subscribeToSpecificOrder = useCallback((orderId) => {
    if (!useFirestore || !orderId) {
      // Fall back to localStorage
      const savedOrders = JSON.parse(localStorage.getItem('420oclock-orders') || '[]')
      const order = savedOrders.find(o => o.id === orderId)
      setCurrentOrder(order || null)
      return () => {}
    }

    const unsubscribe = subscribeToOrder(orderId, (order) => {
      setCurrentOrder(order)
    })

    return unsubscribe
  }, [useFirestore])

  // Create new order
  const addOrder = async (orderData, userId = null) => {
    try {
      if (useFirestore) {
        const orderId = await createOrder({
          ...orderData,
          userId: userId
        })
        
        // Also save to localStorage as backup
        const localOrder = {
          ...orderData,
          id: orderId,
          firestoreId: orderId,
          createdAt: new Date().toISOString()
        }
        
        const savedOrders = JSON.parse(localStorage.getItem('420oclock-orders') || '[]')
        savedOrders.unshift(localOrder)
        localStorage.setItem('420oclock-orders', JSON.stringify(savedOrders))
        
        return orderId
      } else {
        // Fall back to localStorage only
        const orderId = `420-${Math.floor(1000 + Math.random() * 9000)}`
        const localOrder = {
          ...orderData,
          id: orderId,
          createdAt: new Date().toISOString()
        }
        
        const savedOrders = JSON.parse(localStorage.getItem('420oclock-orders') || '[]')
        savedOrders.unshift(localOrder)
        localStorage.setItem('420oclock-orders', JSON.stringify(savedOrders))
        
        // Update state
        setOrders(prev => [localOrder, ...prev])
        
        return orderId
      }
    } catch (err) {
      console.error('Error creating order:', err)
      setError(err.message)
      
      // Fallback to localStorage on error
      const orderId = `420-${Math.floor(1000 + Math.random() * 9000)}`
      const localOrder = {
        ...orderData,
        id: orderId,
        createdAt: new Date().toISOString(),
        error: err.message
      }
      
      const savedOrders = JSON.parse(localStorage.getItem('420oclock-orders') || '[]')
      savedOrders.unshift(localOrder)
      localStorage.setItem('420oclock-orders', JSON.stringify(savedOrders))
      
      return orderId
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      if (useFirestore) {
        await updateOrder(orderId, { status })
      }
      
      // Always update localStorage
      const savedOrders = JSON.parse(localStorage.getItem('420oclock-orders') || '[]')
      const updatedOrders = savedOrders.map(order => 
        order.id === orderId || order.firestoreId === orderId 
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      )
      localStorage.setItem('420oclock-orders', JSON.stringify(updatedOrders))
      setOrders(updatedOrders)
      
    } catch (err) {
      console.error('Error updating order:', err)
      setError(err.message)
    }
  }

  // Confirm payment
  const completePayment = async (orderId, paymentReference) => {
    try {
      if (useFirestore) {
        await confirmPayment(orderId, paymentReference)
      }
      
      // Update localStorage
      const savedOrders = JSON.parse(localStorage.getItem('420oclock-orders') || '[]')
      const updatedOrders = savedOrders.map(order => 
        order.id === orderId || order.firestoreId === orderId 
          ? { 
              ...order, 
              paymentStatus: 'paid', 
              paymentReference,
              status: 'processing',
              paidAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : order
      )
      localStorage.setItem('420oclock-orders', JSON.stringify(updatedOrders))
      setOrders(updatedOrders)
      
    } catch (err) {
      console.error('Error confirming payment:', err)
      setError(err.message)
      
      // Still update locally
      const savedOrders = JSON.parse(localStorage.getItem('420oclock-orders') || '[]')
      const updatedOrders = savedOrders.map(order => 
        order.id === orderId 
          ? { ...order, paymentStatus: 'paid', paymentReference }
          : order
      )
      localStorage.setItem('420oclock-orders', JSON.stringify(updatedOrders))
    }
  }

  // Add location to order
  const addOrderLocation = async (orderId, location) => {
    try {
      if (useFirestore) {
        await updateOrderLocation(orderId, location)
      }
      
      // Update localStorage
      const savedOrders = JSON.parse(localStorage.getItem('420oclock-orders') || '[]')
      const updatedOrders = savedOrders.map(order => 
        order.id === orderId || order.firestoreId === orderId 
          ? { 
              ...order, 
              delivery: { 
                ...order.delivery, 
                location,
                locationReceivedAt: new Date().toISOString()
              },
              status: 'processing',
              updatedAt: new Date().toISOString()
            }
          : order
      )
      localStorage.setItem('420oclock-orders', JSON.stringify(updatedOrders))
      setOrders(updatedOrders)
      
    } catch (err) {
      console.error('Error adding location:', err)
      setError(err.message)
    }
  }

  // Get order by ID (from local or Firestore)
  const getOrderById = async (orderId) => {
    if (useFirestore) {
      const order = await getOrder(orderId)
      if (order) {
        setCurrentOrder(order)
        return order
      }
    }
    
    // Fallback to localStorage
    const savedOrders = JSON.parse(localStorage.getItem('420oclock-orders') || '[]')
    const order = savedOrders.find(o => o.id === orderId || o.firestoreId === orderId)
    setCurrentOrder(order || null)
    return order || null
  }

  // Clear error
  const clearError = () => setError(null)

  const value = useMemo(() => ({
    // State
    orders,
    currentOrder,
    loading,
    error,
    useFirestore,
    
    // Actions
    subscribeToOrders,
    subscribeToSpecificOrder,
    addOrder,
    updateOrderStatus,
    completePayment,
    addOrderLocation,
    getOrderById,
    clearError
  }), [
    orders,
    currentOrder,
    loading,
    error,
    useFirestore,
    subscribeToOrders,
    subscribeToSpecificOrder,
    addOrder,
    updateOrderStatus,
    completePayment,
    addOrderLocation,
    getOrderById,
    clearError
  ])

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  )
}

export default OrdersContext

