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
  const { userId, cartItems, customerDetails, deliveryOption, totalAmount, confirmationNumber, deliveryDate, storeId, creditCardNumber, shippingCost, discount } = req.body;

  // Insert into orders table
  const insertOrderQuery = `
    INSERT INTO orders (user_id, customer_name, address, delivery_option, total_amount, confirmation_number, delivery_date, store_id, credit_card_number, shippingCost, discount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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




// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
