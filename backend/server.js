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

// API for fetching products by category
app.get('/products/category/:category', (req, res) => {
  const category = req.params.category;
  const query = 'SELECT * FROM products WHERE category = ?';
  db.query(query, [category], (err, result) => {
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

// API for placing an order
app.post('/checkout', (req, res) => {
  const { userId, cartItems, customerDetails, deliveryOption, totalAmount, confirmationNumber, deliveryDate } = req.body;

  // Insert into orders table
  const insertOrderQuery = `
    INSERT INTO orders (user_id, customer_name, address, street, city, state, delivery_option, zip_code, total_amount, confirmation_number, delivery_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(insertOrderQuery, [
    userId,
    customerDetails.name,
    customerDetails.address,
    customerDetails.street,
    customerDetails.city,
    customerDetails.state,
    deliveryOption,
    customerDetails.zipCode,
    totalAmount,
    confirmationNumber,
    deliveryDate
  ], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error placing order' });
    }

    const orderId = result.insertId; // Get the ID of the inserted order

    // Insert items into order_items table
    const insertItemsQuery = 'INSERT INTO order_items (order_id, product_id, price) VALUES ?';
    const orderItems = cartItems.map(item => [orderId, item.id, item.price]); // Removed quantity field
    db.query(insertItemsQuery, [orderItems], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error inserting order items' });
      }

      res.json({ message: 'Order placed successfully', confirmationNumber, deliveryDate, totalAmount });
    });
  });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
