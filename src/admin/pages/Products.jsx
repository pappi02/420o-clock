import { useState, useEffect } from 'react'
import ProductFormModal from '../components/ProductFormModal'
import { getAllProducts, subscribeToAllProducts, deleteProduct, uploadProductImage } from '../../firebase/services'
import './Products.css'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  // Load products
  useEffect(() => {
    const unsubscribe = subscribeToAllProducts(setProducts)
    return unsubscribe
  }, [])

  const handleAdd = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return
    
    setDeletingId(productId)
    try {
      await deleteProduct(productId)
    } catch (error) {
      alert('Error deleting product')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSuccess = () => {
    setModalOpen(false)
    setEditingProduct(null)
  }

  if (loading) {
    return <div className="products-loading">Loading products...</div>
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Products ({products.length})</h1>
        <button onClick={handleAdd} className="add-btn">
          + Add Product
        </button>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Type</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="product-thumb" />
                  ) : (
                    'No image'
                  )}
                </td>
                <td>{product.name}</td>
                <td>{product.type}</td>
                <td>{product.category}</td>
                <td>KES {product.price?.toLocaleString()}</td>
                <td>{product.stock}</td>
                <td>
                  <button onClick={() => handleEdit(product)} className="edit-btn">
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)} 
                    disabled={deletingId === product.id}
                    className="delete-btn"
                  >
                    {deletingId === product.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editingProduct}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default Products

