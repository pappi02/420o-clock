import { useState } from 'react'
import { sendEmailInvite } from '../../firebase/services'
import './AddUserModal.css'

const AddUserModal = ({ isOpen, onClose }) => {
const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await sendEmailInvite(email)
      setSuccess(true)
      setEmail('')
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add New User</h3>
        {success ? (
<p className="success">✅ Invitation sent via email!</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              Email Address *
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@420oclock.com"
                required
              />
            </label>
            {error && <p className="error">{error}</p>}
            <div className="modal-buttons">
              <button type="button" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default AddUserModal

