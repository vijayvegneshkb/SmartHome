import React, { useState, useEffect } from 'react';
import './StoreManager.css';

const StoreManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    image: '',
    manufacturer: '',
    category: ''
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState({});

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true); // Set loading to true
    try {
      const response = await fetch('http://localhost:5000/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  // Handle input changes for the new product form
  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  // Handle form submission for adding a product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      });
      if (response.ok) {
        fetchProducts(); // Refresh products after adding
        setNewProduct({
          name: '',
          price: '',
          image: '',
          manufacturer: '',
          category: ''
        });
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  // Handle edit button click
  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setEditingProduct(product);
  };

  // Handle changes in the edit form
  const handleEditInputChange = (e) => {
    setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
  };

  // Handle saving the edited product
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/products/${editingProductId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingProduct)
      });
      if (response.ok) {
        fetchProducts(); // Refresh products after editing
        setEditingProductId(null); // Exit edit mode
        setEditingProduct({});
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (confirmed) {
      try {
        await fetch(`http://localhost:5000/products/${productId}`, { method: 'DELETE' });
        fetchProducts(); // Refresh products after deleting
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <div className="store-manager">
      <h1>Store Manager</h1>

      {/* Form to add a new product */}
      <div className="product-form">
        <h2>Add New Product</h2>
        <form onSubmit={handleAddProduct}>
          <input
            type="text"
            name="name"
            value={newProduct.name}
            onChange={handleInputChange}
            placeholder="Product Name"
            required
          />
          <input
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleInputChange}
            placeholder="Product Price"
            required
          />
          <input
            type="text"
            name="image"
            value={newProduct.image}
            onChange={handleInputChange}
            placeholder="Image Filename"
            required
          />
          <input
            type="text"
            name="manufacturer"
            value={newProduct.manufacturer}
            onChange={handleInputChange}
            placeholder="Manufacturer"
            required
          />
          <input
            type="text"
            name="category"
            value={newProduct.category}
            onChange={handleInputChange}
            placeholder="Category"
            required
          />
          <button type="submit" className="add-button">Add Product</button>
        </form>
      </div>

      {/* Loading indicator */}
      {loading && <p>Loading products...</p>}

      {/* Table displaying current products */}
      <div className="products-list">
        <h2>Products List</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Image</th>
              <th>Manufacturer</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) =>
              editingProductId === product.id ? (
                <tr key={product.id}>
                  <td><input name="name" value={editingProduct.name} onChange={handleEditInputChange} /></td>
                  <td><input name="price" value={editingProduct.price} onChange={handleEditInputChange} /></td>
                  <td><input name="image" value={editingProduct.image} onChange={handleEditInputChange} /></td>
                  <td><input name="manufacturer" value={editingProduct.manufacturer} onChange={handleEditInputChange} /></td>
                  <td><input name="category" value={editingProduct.category} onChange={handleEditInputChange} /></td>
                  <td>
                    <button onClick={handleSaveEdit} className="save-button">Save</button>
                    <button onClick={() => setEditingProductId(null)} className="cancel-button">Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.image}</td>
                  <td>{product.manufacturer}</td>
                  <td>{product.category}</td>
                  <td>
                    <button onClick={() => handleEditClick(product)} className="edit-button">Edit</button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="delete-button">Delete</button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreManager;
