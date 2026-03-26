import { useState } from 'react'
import './Header.css'
import ClockLogo from '../shared/ClockLogo'
import CartIcon from '../shared/CartIcon'
import LocationPicker from '../shared/LocationPicker'

function Header({ onMenuClick, cartCount = 0, onCartClick, onOrdersClick, onBestsellersClick }) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <button className="menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
            <span className="menu-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <div className="logo">
            <ClockLogo />
            <span className="logo-text">420o'clock</span>
          </div>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="search-btn">Search</button>
        </form>

        <div className="header-right">
          <button className="bestsellers-btn" onClick={onBestsellersClick} aria-label="Bestsellers">
            🔥 Bestsellers
          </button>
          <button className="orders-btn" onClick={onOrdersClick} aria-label="My Orders">

            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Orders</span>
          </button>
          <LocationPicker />
          <button className="cart-btn" onClick={onCartClick} aria-label="Shopping cart">
            <CartIcon count={cartCount} />
          </button>
          <button className="profile-btn" aria-label="Profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

