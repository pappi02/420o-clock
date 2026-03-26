import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('420oclock-cart')
    return savedCart ? JSON.parse(savedCart) : []
  })
  const [cartTotal, setCartTotal] = useState(0)
  const deliveryFee = 500 // KES 500 delivery fee
  const taxRate = 0.16 // 16% VAT

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('420oclock-cart', JSON.stringify(cart))
  }, [cart])

  // Calculate totals
  useEffect(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * taxRate
    const total = subtotal + deliveryFee + tax
    setCartTotal({ subtotal, tax, total })
  }, [cart])

  const addToCart = useCallback((product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prevCart, { ...product, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const getCartCount = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const value = useMemo(() => ({
    cart,
    cartTotal,
    deliveryFee,
    taxRate,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount
  }), [
    cart,
    cartTotal,
    deliveryFee,
    taxRate,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount
  ])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export default CartContext

