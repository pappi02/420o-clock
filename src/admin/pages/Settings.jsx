import { useState, useEffect } from 'react'
import { collection, getDocs, doc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import OrderStatusSelect from '../components/OrderStatusSelect'
import './Settings.css'

const Settings = () => {
  const [admins, setAdmins] = useState([])
  const [newAdminUid, setNewAdminUid] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'admins'))
      const adminList = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }))
      setAdmins(adminList)
    } catch (error) {
      console.error('Error loading admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const addAdmin = async () => {
    if (!newAdminUid.trim()) return
    
    try {
      await setDoc(doc(db, 'admins', newAdminUid.trim()), {
        isAdmin: true,
        addedAt: new Date().toISOString()
      })
      setNewAdminUid('')
      loadAdmins()
    } catch (error) {
      alert('Error adding admin: ' + error.message)
    }
  }

  const removeAdmin = async (uid) => {
    if (!window.confirm('Remove admin access?')) return
    
    try {
      await setDoc(doc(db, 'admins', uid), { isAdmin: false }, { merge: true })
      loadAdmins()
    } catch (error) {
      alert('Error removing admin: ' + error.message)
    }
  }

  if (loading) return <div>Loading settings...</div>

  return (
    <div className="settings-page">
      <h1>Admin Settings</h1>
      
      <div className="settings-section">
        <h2>Current Admins ({admins.length})</h2>
        <div className="admins-list">
          {admins.map(admin => (
            <div key={admin.uid} className="admin-item">
              <div>
                <strong>{admin.uid}</strong>
              </div>
              <button 
                onClick={() => removeAdmin(admin.uid)}
                className="remove-admin-btn"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2>Add New Admin</h2>
        <div className="add-admin-form">
          <input
            type="text"
            value={newAdminUid}
            onChange={(e) => setNewAdminUid(e.target.value)}
            placeholder="Enter user UID"
            className="uid-input"
          />
          <button onClick={addAdmin} disabled={!newAdminUid.trim()}>
            Add Admin
          </button>
        </div>
        <p className="help-text">
          Enter the Firebase Auth UID of the user to grant admin access.
        </p>
      </div>
    </div>
  )
}

export default Settings

