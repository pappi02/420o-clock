import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AdminLayout.css' // Will create later

const AdminLayout = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const navItems = [
    { to: '/admin', label: '📊 Dashboard', icon: '📊' },
    { to: '/admin/products', label: 'Products', icon: '🛍️' },
    { to: '/admin/orders', label: 'Orders', icon: '📦' },
    { to: '/admin/settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <div className="admin-layout">
      {/* Top Header */}
      <header className="admin-header">
        <div className="header-left">
          <Link to="/admin" className="logo">
            420o'clock Admin
          </Link>
        </div>
        <div className="header-right">
          <span className="user-info">👤 {user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="admin-main">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <Link 
                key={item.to} 
                to={item.to} 
                className="nav-item"
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

