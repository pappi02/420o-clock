import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import '../pages/SignIn.css'

const SignIn = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const auth = getAuth()

  useEffect(() => {
    const handleSignIn = async () => {
      try {
        if (isSignInWithEmailLink(auth, window.location.href)) {
          const urlParams = new URLSearchParams(location.search)
          const emailParam = urlParams.get('email')
          
          if (emailParam) {
            // Complete sign-in with email from URL
            await signInWithEmailLink(auth, emailParam, window.location.href)
            // Success - redirect to dashboard (or home)
            navigate('/admin') // or '/'
            return
          }
        }
      } catch (err) {
        console.error('Sign-in error:', err)
        setError('Link expired or invalid. Request a new invitation.')
      } finally {
        setLoading(false)
      }
    }

    handleSignIn()
  }, [location, navigate, auth])

  const handleManualEmail = async (e) => {
    e.preventDefault()
    if (!email) return
    
    try {
      await signInWithEmailLink(auth, email, window.location.href)
      navigate('/admin')
    } catch (err) {
      setError('Invalid link or email. Please request a new invitation.')
    }
  }

  if (loading) {
    return (
      <div className="signin-container">
        <div className="loading">Completing sign-in...</div>
      </div>
    )
  }

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2>Complete Your Sign-In</h2>
        {error && <p className="error">{error}</p>}
        
        <form onSubmit={handleManualEmail}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter the email you received the invitation for"
            className="email-input"
          />
          <button type="submit" className="signin-btn">
            Sign In
          </button>
        </form>
        
        <p className="help-text">
          Clicked the invitation email link? It should have auto-completed. If not, enter your email above.
        </p>
      </div>
    </div>
  )
}

export default SignIn
