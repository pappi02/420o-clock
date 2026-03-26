import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { products } from '../data/products.js'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Sidebar from '../components/layout/Sidebar'
import ProductGrid from '../components/product/ProductGrid'
import './ProductDetail.css' // Reuse some styles

// Bestsellers Page - Filtered bestsellers with full filters/sidebar
const Bestsellers = () => {
  const { addToCart, getCartCount } = useCart()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [filteredProducts, setFilteredProducts] = useState([])

  // Base: Only bestseller products (~9 items)
  const bestsellerProducts = useMemo(() => 
    products.filter(p => p.bestseller).sort((a, b) => b.rating - a.rating),
    []
  )

  useEffect(() => {
    setLoading(false)
    setFilteredProducts(bestsellerProducts)
  }, [bestsellerProducts])

  useEffect(() => {
    let result = bestsellerProducts

    // Bestseller filter (redundant but consistent)
    if (filters.bestseller !== false) {
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

    // Price filter
    if (filters.priceMin || filters.priceMax) {
      result = result.filter(p => {
        const price = Number(p.price)
        return (!filters.priceMin || price >= filters.priceMin) &&
               (!filters.priceMax || price <= filters.priceMax)
      })
    }

    // THC filter
    if (filters.thcMin !== undefined || filters.thcMax !== undefined) {
      result = result.filter(p => {
        const thcNum = Number(p.thc.replace('%', ''))
        return (filters.thcMin === undefined || thcNum >= filters.thcMin) &&
               (filters.thcMax === undefined || thcNum <= filters.thcMax)
      })
    }

    setFilteredProducts(result)
  }, [filters, bestsellerProducts])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setSidebarOpen(false)
  }, [])

  const handleAddToCart = useCallback((product) => {
    addToCart(product, 1)
  }, [addToCart])

  const cartCount = getCartCount()

  const handleQuickView = () => {
    console.log('Quick view clicked')
  }

  const handleOrdersClick = () => navigate('/orders')
  const handleCartClick = () => navigate('/cart')

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">⏰</div>
        <p>Loading bestsellers...</p>
      </div>
    )
  }

  return (
    <div className="bestsellers-page">
      <Header 
        cartCount={cartCount}
        onMenuClick={toggleSidebar}
        onCartClick={handleCartClick}
        onOrdersClick={handleOrdersClick}
        onBestsellersClick={() => navigate('/bestsellers')}
      />
      
      <main className="main-content">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={toggleSidebar}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        
        <div className="products-section">
          <div className="section-header">
            <h2>🔥 Bestsellers ({filteredProducts.length} items)</h2>
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

export default Bestsellers

