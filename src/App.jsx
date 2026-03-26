// App.jsx - Updated with Firebase Integration
// No Backend Required - All Client-Side!

import { useState, useEffect, useMemo, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ScheduleProvider } from './context/ScheduleContext'
import { OrdersProvider } from './context/OrdersContext'
import { useCart } from './context/CartContext'
import { products } from './data/products.js'
import AdminLayout from './admin/AdminLayout'
import AdminRoute from './admin/AdminRoute'
import Login from './pages/Login'
import Dashboard from './admin/pages/Dashboard'
import Products from './admin/pages/Products'
import Orders from './admin/pages/Orders'
import Settings from './admin/pages/Settings'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Sidebar from './components/layout/Sidebar'
import ProductGrid from './components/product/ProductGrid'
import Cart from './components/checkout/Cart'
import Checkout from './components/checkout/Checkout'
import OrderList from './components/orders/OrderList'
import OrderTracker from './components/orders/OrderTracker'
import ProductDetail from './pages/ProductDetail'
import Bestsellers from './pages/Bestsellers'
import SignIn from './pages/SignIn'
import './styles/global.css'

// ScrollToTop Component
const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

// Full Home Page Component - Featured Products + Filters
const Home = () => {
  const { addToCart, getCartCount } = useCart()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [filteredProducts, setFilteredProducts] = useState([])

  // Featured: Sort by bestseller/rating, take top 12 - MEMOIZED
  const featuredProducts = useMemo(() => 
    products
      .map(p => ({ ...p, score: (p.bestseller ? 100 : 0) + p.rating * 10 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12),
    []
  )

  useEffect(() => {
    setLoading(false)
    setFilteredProducts(featuredProducts)
  }, [featuredProducts])

  useEffect(() => {
    let result = featuredProducts

    // Bestseller filter
    if (filters.bestseller) {
      result = result.filter(p => p.bestseller)
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter(p => p.category === filters.category)
    }

    // Effects filter
    if (filters.effects && filters.effects.length > 0) {
      result = result.filter(p => 
        filters.effects.some(effect => p.effects?.includes(effect))
      )
    }

    // Price filter (price is number)
    if (filters.priceMin || filters.priceMax) {
      result = result.filter(p => {
        const price = Number(p.price)
        return (!filters.priceMin || price >= filters.priceMin) &&
               (!filters.priceMax || price <= filters.priceMax)
      })
    }

    // THC filter (parse %)
    if (filters.thcMin !== undefined || filters.thcMax !== undefined) {
      result = result.filter(p => {
        const thcNum = Number(p.thc.replace('%', ''))
        return (filters.thcMin === undefined || thcNum >= filters.thcMin) &&
               (filters.thcMax === undefined || thcNum <= filters.thcMax)
      })
    }

    setFilteredProducts(result)
  }, [filters, featuredProducts])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setSidebarOpen(false) // Close sidebar after apply
  }, [])

  const handleAddToCart = useCallback((product) => {
    addToCart(product, 1)
  }, [addToCart])

  const cartCount = getCartCount()

  const handleQuickView = () => {
    // Placeholder for modal quick view
    console.log('Quick view clicked')
  }

  const navigate = useNavigate()
  const handleOrdersClick = () => {
    navigate('/orders')
  }

  const handleCartClick = () => {
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">⏰</div>
        <p>Loading fresh stock...</p>
      </div>
    )
  }

  return (
    <div className="home-page">
      <Header 
        cartCount={cartCount}
        onMenuClick={toggleSidebar}
        onCartClick={handleCartClick}
        onOrdersClick={handleOrdersClick}
        onBestsellersClick={() => navigate('/bestsellers')}
      />
      
      {/* Hero Banner */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Fresh Kenyan Buds</h1>
          <p className="hero-subtitle">20-40 min delivery • Starting KES 50</p>
          <div className="hero-cta">
<button className="btn-primary btn-large" onClick={() => navigate('/bestsellers')}>Explore Bestsellers</button>
          </div>
        </div>
      </section>

      <main className="main-content">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={toggleSidebar}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        
        <div className="products-section">
          <div className="section-header">
            <h2>Featured Products</h2>
            <span className="product-count">{filteredProducts.length} items</span>
          </div>
          <ProductGrid
            products={filteredProducts}
            onAddToCart={handleAddToCart}
            onQuickView={handleQuickView}
            isLoading={loading}
            onClearFilters={() => setFilters({})}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

const AppContent = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/track/:orderId" element={<OrderTracker />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/bestsellers" element={<Bestsellers />} />

        {/* Admin Routes */}

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ScrollToTop />
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrdersProvider>
          <AppContent />
        </OrdersProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App

