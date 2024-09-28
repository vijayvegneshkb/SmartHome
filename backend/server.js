const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'smarthomes_db'
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected to MySQL');
  }
});

// API for fetching all products
app.get('/products', (req, res) => {
  const query = 'SELECT * FROM products';
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});
// API for fetching a specific product by ID
app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const query = 'SELECT * FROM products WHERE id = ?';
  
  db.query(query, [productId], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.length === 0) {
      res.status(404).send('Product not found');
    } else {
      res.json(result[0]);
    }
  });
});

// API for adding a new product
app.post('/products', (req, res) => {
  const { name, price, image, manufacturer, category } = req.body;
  
  const query = 'INSERT INTO products (name, price, image, manufacturer, category) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [name, price, image, manufacturer, category], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error adding product' });
    }
    
    res.status(201).json({
      id: result.insertId,
      name,
      price,
      image,
      manufacturer,
      category,
    });
  });
});

// API for updating a specific product by ID
app.put('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, price, image, manufacturer, category } = req.body;
  const query = 'UPDATE products SET name = ?, price = ?, image = ?, manufacturer = ?, category = ? WHERE id = ?';

  db.query(query, [name, price, image, manufacturer, category, productId], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.affectedRows === 0) {
      res.status(404).send('Product not found');
    } else {
      res.json({ id: productId, name, price, image, manufacturer, category });
    }
  });
});

// API for deleting a specific product by ID
app.delete('/products/:id', (req, res) => {
  const productId = req.params.id;
  
  const query = 'DELETE FROM products WHERE id = ?';
  
  db.query(query, [productId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error deleting product' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  });
});



// API for fetching users for login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.length > 0) {
      res.json({ loggedIn: true, user: result[0] });
    } else {
      res.json({ loggedIn: false });
    }
  });
});

// API for user registration
app.post('/register', (req, res) => {
  const { username, password, role } = req.body;
  // Validate role (assuming you want to ensure it's one of the predefined roles)
  if (!['customer', 'salesman', 'manager'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  // Check if the username already exists
  const checkQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(checkQuery, [username], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    } else if (result.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    // Insert the new user into the database
    const insertQuery = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    db.query(insertQuery, [username, password, role], (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});



// API to fetch all store locations for in-store pickup
app.get('/store-locations', (req, res) => {
  const query = 'SELECT * FROM StoreLocations';
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

// API for placing an order
// API for placing an order
app.post('/checkout', (req, res) => {
  const { userId, cartItems, customerDetails, deliveryOption, totalAmount, confirmationNumber, deliveryDate, storeId, creditCardNumber, shippingCost, discount, quantity } = req.body;

  // Insert into orders table
  const insertOrderQuery = `
    INSERT INTO orders (user_id, customer_name, address, delivery_option, total_amount, confirmation_number, delivery_date, store_id, credit_card_number, shippingCost, discount, quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(insertOrderQuery, [
    userId,
    customerDetails.name,
    customerDetails.address,
    deliveryOption,
    totalAmount,
    confirmationNumber,
    deliveryDate,
    storeId || null, // StoreID for in-store pickup, null for home delivery
    creditCardNumber,
    shippingCost,
    discount,
    quantity, 
  ], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error placing order' });
    }

    const orderId = result.insertId; // Get the ID of the inserted order

    // Insert items into order_items table
    const insertItemsQuery = 'INSERT INTO order_items (order_id, product_id, price) VALUES ?';
    const items = cartItems.map(item => [orderId, item.id, item.price]);

    db.query(insertItemsQuery, [items], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error adding items to order' });
      }

      res.json({
        message: 'Order placed successfully',
        confirmationNumber: confirmationNumber,
        deliveryDate: deliveryDate,
        totalAmount: totalAmount,
      });
    });
  });
});

// API for fetching distinct manufacturers
app.get('/manufacturers', (req, res) => {
  const query = 'SELECT DISTINCT manufacturer FROM products';
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

// API for fetching categories and their respective manufacturers
app.get('/categories', (req, res) => {
  const query = `
    SELECT category, manufacturer
    FROM products
    GROUP BY category, manufacturer
  `;
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    
    // Group manufacturers under their respective categories
    const categories = {};
    result.forEach(row => {
      if (!categories[row.category]) {
        categories[row.category] = [];
      }
      categories[row.category].push(row.manufacturer);
    });

    res.json(categories);
  });
});

// API for fetching products by category and manufacturer
app.get('/products/category/:category', (req, res) => {
  const category = req.params.category;
  const manufacturer = req.query.manufacturer; // Get manufacturer from query params
  let query = 'SELECT * FROM products WHERE category = ?';
  let queryParams = [category];

  // Check if manufacturer is provided and modify the query accordingly
  if (manufacturer) {
    query += ' AND manufacturer = ?';
    queryParams.push(manufacturer);
  }

  db.query(query, queryParams, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});


// server.js

// API for fetching all orders
app.get('/orders', (req, res) => {
  const userId = req.query.userId; // Get user ID from query parameters
  let query = 'SELECT orders.*, order_items.product_id, order_items.price, products.name AS product_name ' +
              'FROM orders ' +
              'LEFT JOIN order_items ON orders.id = order_items.order_id ' +
              'LEFT JOIN products ON order_items.product_id = products.id';
  if (userId) {
    query += ' WHERE orders.user_id = ?'; // Filter orders by user ID if provided
  }

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
    const orders = result.reduce((acc, row) => {
      const { id, customer_name, address, delivery_option, total_amount, confirmation_number, delivery_date, product_id, product_name, price, discount } = row;
      if (!acc[id]) {
        acc[id] = {
          id,
          customer_name,
          address,
          delivery_option,
          total_amount,
          confirmation_number,
          delivery_date,
          products: []
        };
      }
      acc[id].products.push({ product_id, product_name, price, discount });
      return acc;
    }, {});
    res.json(Object.values(orders));
  });
});

// API to delete an order
app.delete('/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const deleteOrderQuery = 'DELETE FROM orders WHERE id = ?';
  const deleteOrderItemsQuery = 'DELETE FROM order_items WHERE order_id = ?';

  db.query(deleteOrderItemsQuery, [orderId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error deleting order items' });
    }
    db.query(deleteOrderQuery, [orderId], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error deleting order' });
      }
      res.json({ message: 'Order deleted successfully' });
    });
  });
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
