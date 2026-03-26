import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { subscribeToAllOrders } from '../../firebase/services'
import { db } from '../../firebase/config'
import AddUserModal from '../components/AddUserModal'
import './Dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    recentOrders: [],
    revenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  // Get stats
  useEffect(() => {
    setLoading(true)
    
    // Fetch products once
    const fetchProducts = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, 'products'))
        return productsSnapshot.size
      } catch (error) {
        console.error('Error fetching products:', error)
        return 0
      }
    }

    // Setup orders subscription
    const unsubscribeOrders = subscribeToAllOrders((orders) => {
      const recentOrders = orders.slice(0, 5)
      const revenue = orders.reduce((sum, order) => sum + (order.totals?.total || 0), 0)
      
      fetchProducts().then(totalProducts => {
        setStats({
          totalProducts,
          totalOrders: orders.length,
          recentOrders,
          revenue
        })
        setLoading(false)
      })
    })

    return () => {
      unsubscribeOrders()
    }
  }, [])

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome back, Admin!</p>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h2>{stats.totalProducts}</h2>
          <p>Products</p>
        </div>
        <div className="stat-card">
          <h2>{stats.totalOrders}</h2>
          <p>Orders</p>
        </div>
        <div className="stat-card">
          <h2>KES {Math.round(stats.revenue).toLocaleString()}</h2>
          <p>Revenue</p>
        </div>
        <button className="add-user-btn" onClick={() => setModalOpen(true)}>
          ➕ Add User
        </button>
      </div>

      {/* Recent Orders */}
      <div className="recent-orders-section">
        <h3>Recent Orders</h3>
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id.slice(-6)}</td>
                  <td>{order.customer?.name || 'N/A'}</td>
                  <td>KES {order.totals?.total?.toLocaleString()}</td>
                  <td>
                    <span className={`status status-${order.status}`}>
                      {order.status?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default Dashboard
