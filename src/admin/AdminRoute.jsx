import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const AdminRoute = () => {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setChecking(false)
        return
      }
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid))
        setIsAdmin(adminDoc.exists())
      } catch (error) {
        console.error('Error checking admin:', error)
      }
      setChecking(false)
    }
    
    checkAdmin()
  }, [user])

  if (loading || checking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    )
  }

  return user && isAdmin ? <Outlet /> : <Navigate to="/login" replace />
}

export default AdminRoute

