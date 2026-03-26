import { useState, useEffect } from 'react'
import { doc, setDoc, addDoc, collection, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../firebase/config'
import './ProductFormModal.css'

const ProductFormModal = ({ open, onClose, product, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    thc: '',
    cbd: '',
    price: '',
    stock: '',
    description: '',
    effects: '',
    brand: '',
    origin: '',
    image: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        type: product.type || '',
        category: product.category || '',
        thc: product.thc || '',
        cbd: product.cbd || '',
        price: product.price || '',
        stock: product.stock || '',
        description: product.description || '',
        effects: product.effects?.join(', ') || '',
        brand: product.brand || '',
        origin: product.origin || '',
        image: product.image || ''
      })
      setImagePreview(product.image || '')
    } else {
      setFormData({
        name: '', type: '', category: '', thc: '', cbd: '', price: '', stock: '',
        description: '', effects: '', brand: '', origin: ''
      })
      setImagePreview('')
    }
    setImageFile(null)
  }, [product])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      let imageUrl = formData.image || ''
      if (imageFile) {
        setUploading(true)
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`)
        const snapshot = await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(snapshot.ref)
        setUploading(false)
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        thc: parseFloat(formData.thc),
        cbd: parseFloat(formData.cbd),
        effects: formData.effects.split(',').map(e => e.trim()).filter(Boolean),
        image: imageUrl,
        updatedAt: new Date().toISOString()
      }

      if (product) {
        await updateDoc(doc(db, 'products', product.id), productData)
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: new Date().toISOString()
        })
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <input 
              name="name" 
              placeholder="Name *" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
            
            <select name="type" value={formData.type} onChange={handleChange} required>
              <option value="">Type</option>
              <option value="flower">Flower</option>
              <option value="preroll">Preroll</option>
              <option value="edible">Edible</option>
              <option value="vape">Vape</option>
              <option value="g-bags">G-Bags</option>
            </select>

            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="">Category</option>
              <option value="indica">Indica</option>
              <option value="sativa">Sativa</option>
              <option value="hybrid">Hybrid</option>
              <option value="landrace">Landrace</option>
              <option value="cbd">CBD</option>
            </select>

            <input name="thc" type="number" step="0.1" placeholder="THC %" value={formData.thc} onChange={handleChange} />
            <input name="cbd" type="number" step="0.1" placeholder="CBD %" value={formData.cbd} onChange={handleChange} />
            <input name="price" type="number" step="1" placeholder="Price (KES)" value={formData.price} onChange={handleChange} required />
            <input name="stock" type="number" placeholder="Stock" value={formData.stock} onChange={handleChange} />
            <input name="brand" placeholder="Brand" value={formData.brand} onChange={handleChange} />
            <input name="origin" placeholder="Origin" value={formData.origin} onChange={handleChange} />
            
            <textarea 
              name="description" 
              placeholder="Description" 
              rows="3" 
              value={formData.description} 
              onChange={handleChange} 
            />
            
            <input 
              name="effects" 
              placeholder="Effects (comma separated)" 
              value={formData.effects} 
              onChange={handleChange} 
            />
          </div>

          <div className="image-upload">
            {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {uploading && <div>Uploading...</div>}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductFormModal

