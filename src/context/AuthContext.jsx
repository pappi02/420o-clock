import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkingAdmin, setCheckingAdmin] = useState(false)

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      
      if (firebaseUser) {
        // Check admin status
        setCheckingAdmin(true)
        try {
          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid))
          setIsAdmin(adminDoc.exists())
        } catch (error) {
          console.error('Error checking admin:', error)
          setIsAdmin(false)
        }
        setCheckingAdmin(false)
      } else {
        setIsAdmin(false)
      }
    })

    return unsubscribe
  }, [])

  const signIn = useCallback(async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      throw error
    }
  }, [])

  const signUp = useCallback(async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
    } catch (error) {
      throw error
    }
  }, [])

  const value = useMemo(() => ({
    user,
    isAdmin,
    loading: loading || checkingAdmin,
    signIn,
    signUp,
    logout
  }), [user, isAdmin, loading, checkingAdmin, signIn, signUp, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext

