// Firebase Services for 420o'clock
// Firestore CRUD Operations - No Backend Required!

import { 
  db, 
  auth,
  storage 
} from './config'

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  setDoc
} from 'firebase/firestore'

import { 
  ref,
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage'

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink
} from 'firebase/auth'

import { getFunctions, httpsCallable } from 'firebase/functions'
import { functions } from './config'

// ============================================
// ORDERS SERVICE (Admin + User)
// ============================================

/**
 * Create a new order in Firestore
 */
export const createOrder = async (orderData) => {
  try {
    const ordersRef = collection(db, 'orders')
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      status: 'awaiting_location',
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timeline: {
        order_placed: serverTimestamp()
      }
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

/**
 * Get single order by ID
 */
export const getOrder = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId)
    const orderSnap = await getDoc(orderRef)
    
    if (orderSnap.exists()) {
      return { id: orderSnap.id, ...orderSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting order:', error)
    throw error
  }
}

/**
 * Get ALL orders for admin (real-time)
 */
export const subscribeToAllOrders = (callback) => {
  const q = query(
    collection(db, 'orders'),
    orderBy('createdAt', 'desc')
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
    }))
    callback(orders)
  }, (error) => {
    console.error('Error fetching orders:', error)
    callback([])
  })

  return unsubscribe
}

/**
 * Get user orders (real-time)
 */
export const subscribeToUserOrders = (userId, callback) => {
  if (!userId) {
    callback([])
    return () => {}
  }

  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
    }))
    callback(orders)
  })

  return unsubscribe
}

/**
 * Subscribe to specific order
 */
export const subscribeToOrder = (orderId, callback) => {
  const orderRef = doc(db, 'orders', orderId)
  
  const unsubscribe = onSnapshot(orderRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data()
      callback({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      })
    } else {
      callback(null)
    }
  })

  return unsubscribe
}

/**
 * Update order status
 */
export const updateOrder = async (orderId, updates) => {
  try {
    const orderRef = doc(db, 'orders', orderId)
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

/**
 * Confirm payment
 */
export const confirmPayment = async (orderId, paymentReference) => {
  try {
    const orderRef = doc(db, 'orders', orderId)
    await updateDoc(orderRef, {
      paymentStatus: 'paid',
      paymentReference: paymentReference,
      status: 'processing',
      paidAt: serverTimestamp(),
      'timeline.payment_confirmed': serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error confirming payment:', error)
    throw error
  }
}

/**
 * Update order location
 */
export const updateOrderLocation = async (orderId, location) => {
  try {
    const orderRef = doc(db, 'orders', orderId)
    await updateDoc(orderRef, {
      'delivery.location': location,
      'delivery.locationReceivedAt': serverTimestamp(),
      status: 'processing',
      'timeline.location_shared': serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating location:', error)
    throw error
  }
}

// ============================================
// PRODUCTS SERVICE (Admin CRUD)
// ============================================

/**
 * Get all products (admin)
 */
export const getAllProducts = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'products'))
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting products:', error)
    return []
  }
}

/**
 * Subscribe to all products (admin)
 */
export const subscribeToAllProducts = (callback) => {
  const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(products)
  })
  return unsubscribe
}

/**
 * Create/update product
 */
export const saveProduct = async (productData, productId = null) => {
  try {
    if (productId) {
      await updateDoc(doc(db, 'products', productId), productData)
    } else {
      await addDoc(collection(db, 'products'), productData)
    }
  } catch (error) {
    console.error('Error saving product:', error)
    throw error
  }
}

/**
 * Delete product
 */
export const deleteProduct = async (productId) => {
  try {
    await deleteDoc(doc(db, 'products', productId))
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

/**
 * Get public products
 */
export const getProducts = async () => {
  try {
    const productsRef = collection(db, 'products')
    const q = query(productsRef, where('stock', '>', 0))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null // Use static fallback
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting products:', error)
    return null
  }
}

export const subscribeToProducts = (callback) => {
  const q = query(
    collection(db, 'products'),
    where('stock', '>', 0)
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null)
    } else {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(products)
    }
  })

  return unsubscribe
}

// ============================================
// STORAGE SERVICE (Product Images)
// ============================================

/**
 * Upload product image
 */
export const uploadProductImage = async (file) => {
  try {
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`)
    const snapshot = await uploadBytes(storageRef, file)
    const url = await getDownloadURL(snapshot.ref)
    return url
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

/**
 * Delete product image
 */
export const deleteProductImage = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath)
    await deleteObject(imageRef)
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}

// ============================================
// ADMIN SERVICE
// ============================================

/**
 * Check if user is admin
 */
export const isUserAdmin = async (uid) => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid))
    return adminDoc.exists()
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Add admin (UID document)
 */
export const addAdmin = async (uid) => {
  try {
    await setDoc(doc(db, 'admins', uid), { isAdmin: true })
  } catch (error) {
    console.error('Error adding admin:', error)
    throw error
  }
}

// ============================================
// AUTH SERVICE
// ============================================

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error('Error signing up:', error)
    throw error
  }
}

export const logout = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export const subscribeToAuth = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user)
  })
}

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error('Error sending password reset:', error)
    throw error
  }
}

// ============================================
  // EMAIL INVITE SERVICE (for Admin)
  // ============================================

/**
 * Send email invite to new user (passwordless signup link)
 */
export const sendEmailInvite = async (email) => {
  if (!auth.currentUser) {
    throw new Error("Must be logged in to send invites");
  }

  const callerUid = auth.currentUser.uid;
  
  // Check admin status
  const adminDoc = await getDoc(doc(db, "admins", callerUid));
  if (!adminDoc.exists()) {
    throw new Error("Admin access required");
  }

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail.includes('@')) {
    throw new Error("Valid email required");
  }

  // Check if pending invite already exists
  const pendingRef = doc(db, "pendingUsers", normalizedEmail);
  const existingSnap = await getDoc(pendingRef);
  if (existingSnap.exists()) {
    throw new Error("Invitation already pending for this email");
  }

  // Create pending user record
  await setDoc(pendingRef, {
    email: normalizedEmail,
    status: "pending",
    invitedBy: callerUid,
    invitedAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days
  });

  // Send Firebase magic link
  const actionCodeSettings = {
    // Redirect to app after email verification
    url: `${window.location.origin}/signin?mode=signInWithEmailLink&email=${encodeURIComponent(normalizedEmail)}`,
    // This must be true for email link sign-in
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings);
};

// ============================================
  // DRIVERS SERVICE
  // ============================================

export const subscribeToDriverLocation = (driverId, callback) => {
  if (!driverId) {
    callback(null)
    return () => {}
  }

  const driverRef = doc(db, 'drivers', driverId)
  
  const unsubscribe = onSnapshot(driverRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data())
    } else {
      callback(null)
    }
  })

  return unsubscribe
}

export const updateDriverLocation = async (driverId, location) => {
  try {
    const driverRef = doc(db, 'drivers', driverId)
    await updateDoc(driverRef, {
      location: location,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating driver location:', error)
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const convertDocToObj = (doc) => {
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data()?.createdAt?.toDate?.() || null,
    updatedAt: doc.data()?.updatedAt?.toDate?.() || null
  }
}



export const isFirebaseConfigured = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  return apiKey && apiKey !== 'demo-api-key'
}

