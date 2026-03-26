import { useState, useEffect } from 'react'
import { updateOrder } from '../../firebase/services'
import { subscribeToAllOrders } from '../../firebase/services'
import OrderStatusSelect from '../components/OrderStatusSelect'
import './Orders.css'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders(setOrders)
    setLoading(false)
    return unsubscribe
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await updateOrder(orderId, { status: newStatus })
    } catch (error) {
      alert('Error updating status')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return <div className="orders-loading">Loading orders...</div>
  }

  return (
    <div className="orders-page">
      <h1>Orders ({orders.length})</h1>
      
      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id.slice(-6).toUpperCase()}</td>
                <td>{order.customer?.name || order.contact?.firstName || 'N/A'}</td>
                <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>KES {(order.totals?.total || 0).toLocaleString()}</td>
                <td>{order.status}</td>
                <td>
                  <OrderStatusSelect 
                    current={order.status} 
                    onChange={(status) => handleStatusChange(order.id, status)}
                    disabled={updatingId === order.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Orders

