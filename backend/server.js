const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const fs = require('fs');
const xml2js = require('xml2js');
const util = require('util');
const path = require('path');
const multer = require('multer'); // Middleware for handling file uploads
const { v4: uuidv4 } = require('uuid'); // For generating unique ticket IDs

require("dotenv").config({ path: "../.env" });
const OpenAI = require('openai');

console.log('api key', process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This can be omitted as it's the default
});




const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'smarthomes_db'
});

let productHashMap = {};
let inventoryHashMap = {}; 

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected to MySQL');
    // Parse XML into a hashmap and update the database
    parseXMLToHashMap(() => {
      updateProductsAndInventory(); // Call the new combined function to ensure correct order
    });
  }
});

// Utility to run SQL queries with promises (to avoid callback hell)
const query = util.promisify(db.query).bind(db);

// Function to check if a product exists in the database
async function productExists(name) {
  const result = await query('SELECT id FROM products WHERE name = ?', [name]);
  return result.length > 0 ? result[0].id : null;
}

// Function to read and parse XML file into a hashmap
function parseXMLToHashMap(callback) {
  const filePath = './data/ProductCatalog.xml'; // Update with actual path

  // Read XML file
  fs.readFile(filePath, (err, data) => {
      if (err) {
          console.error('Error reading XML file:', err);
          return;
      }

      // Parse XML data
      const parser = new xml2js.Parser();
      parser.parseString(data, (err, result) => {
          if (err) {
              console.error('Error parsing XML:', err);
              return;
          }

          const products = result.ProductCatalog.Product;
          productHashMap = {}; // Clear the hashmap before repopulating
          inventoryHashMap = {};  // Clear existing inventory

          // Populate the hashmap with product data
          for (const product of products) {
              const name = product.name[0];
              const price = parseFloat(product.price[0]);
              const image = product.image[0];
              const manufacturer = product.manufacturer[0];
              const category = product.category[0];
              const quantity_available = parseInt(product.quantity_available[0]);
              const on_sale = parseInt(product.on_sale[0]);
              const rebate = parseFloat(product.rebate[0]);

              // Add product to the hashmap, using the product name as the key
              productHashMap[name] = {
                  price,
                  image,
                  manufacturer,
                  category
              };
              // Add product to the inventory hashmap, using the product name as the key
              inventoryHashMap[name] = { quantity_available, on_sale, rebate };
          }

          callback(); // Proceed to update the database
      });
  });
}

// Combined function to update products first and then inventory
async function updateProductsAndInventory() {
  try {
    // First, update or insert products
    for (const name in productHashMap) {
      const product = productHashMap[name];
      const { price, image, manufacturer, category } = product;

      let productId = await productExists(name);

      if (productId) {
        // Update product if it exists
        await query(
          'UPDATE products SET price = ?, image = ?, manufacturer = ?, category = ? WHERE id = ?',
          [price, image, manufacturer, category, productId]
        );
        console.log(`Updated product: ${name}`);
      } else {
        // Insert new product and retrieve product_id
        const result = await query(
          'INSERT INTO products (name, price, image, manufacturer, category) VALUES (?, ?, ?, ?, ?)',
          [name, price, image, manufacturer, category]
        );
        productId = result.insertId; // Get the inserted product_id
        console.log(`Inserted new product: ${name}, product_id: ${productId}`);
      }

      // Now update the inventory using the product_id
      const inventory = inventoryHashMap[name];
      const { quantity_available, on_sale, rebate } = inventory;

      const inventoryExists = await query(
        'SELECT * FROM inventory WHERE product_id = ?',
        [productId]
      );

      if (inventoryExists.length > 0) {
        // Update existing inventory record
        await query(
          'UPDATE inventory SET quantity_available = ?, on_sale = ?, rebate = ? WHERE product_id = ?',
          [quantity_available, on_sale, rebate, productId]
        );
        console.log(`Updated inventory for product: ${name}`);
      } else {
        // Insert new inventory record
        await query(
          'INSERT INTO inventory (product_id, quantity_available, on_sale, rebate) VALUES (?, ?, ?, ?)',
          [productId, quantity_available, on_sale, rebate]
        );
        console.log(`Inserted inventory for product: ${name}`);
      }
    }
  } catch (error) {
    console.error('Error updating products and inventory:', error);
  }
}


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
// app.post('/products', (req, res) => {
//   const { name, price, image, manufacturer, category } = req.body;

//   // Step 1: Update productHashMap first
//   productHashMap[name] = { price, image, manufacturer, category };

//   console.log("Product Hashmap after adding new product", productHashMap);

//   // Step 2: Extract the product data from the hashmap
//   const productData = productHashMap[name];

//   // Step 3: Insert the product data into MySQL database
//   const query = 'INSERT INTO products (name, price, image, manufacturer, category) VALUES (?, ?, ?, ?, ?)';
  
//   db.query(query, [name, productData.price, productData.image, productData.manufacturer, productData.category], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ message: 'Error adding product' });
//     }

//     res.status(201).json({
//       id: result.insertId,
//       name,
//       price: productData.price,
//       image: productData.image,
//       manufacturer: productData.manufacturer,
//       category: productData.category,
//     });
//   });
// });

app.post('/products', (req, res) => {
  const { 
    name, 
    price, 
    image, 
    manufacturer, 
    category, 
    quantity_available, 
    on_sale, 
    rebate 
  } = req.body;

  // Step 1: Update productHashMap
  productHashMap[name] = { price, image, manufacturer, category };
  
  // Step 2: Update inventoryHashMap
  inventoryHashMap[name] = { quantity_available, on_sale, rebate };

  console.log("Product Hashmap after adding new product:", productHashMap);
  console.log("Inventory Hashmap after adding new product:", inventoryHashMap);

  // Step 3: Insert the product data into MySQL database
  const productQuery = 'INSERT INTO products (name, price, image, manufacturer, category) VALUES (?, ?, ?, ?, ?)';
  
  db.query(productQuery, [name, price, image, manufacturer, category], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error adding product to products table' });
    }

    // Step 4: Now insert the corresponding inventory data
    const inventoryQuery = 'INSERT INTO inventory (product_id, quantity_available, on_sale, rebate) VALUES (?, ?, ?, ?)';
    
    // Use the last inserted product ID for the inventory record
    const productId = result.insertId; // Get the ID of the newly inserted product
    db.query(inventoryQuery, [productId, quantity_available, on_sale, rebate], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error adding product to inventory table' });
      }

      res.status(201).json({
        id: productId,
        name,
        price,
        image,
        manufacturer,
        category,
        quantity_available,
        on_sale,
        rebate
      });
    });
  });
});


// API for updating a specific product by ID
app.put('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, price, image, manufacturer, category } = req.body;

  // Step 1: Update the product in the hashmap first
  productHashMap[name] = { price, image, manufacturer, category };

  console.log("Product Hashmap after updating new product", productHashMap);

  // Step 2: Extract the product data from the hashmap
  const productData = productHashMap[name];

  // Step 3: Use the product data from the hashmap to update the MySQL database
  const query = 'UPDATE products SET name = ?, price = ?, image = ?, manufacturer = ?, category = ? WHERE id = ?';
  
  db.query(query, [name, productData.price, productData.image, productData.manufacturer, productData.category, productId], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.affectedRows === 0) {
      res.status(404).send('Product not found');
    } else {
      res.json({ id: productId, name, price: productData.price, image: productData.image, manufacturer: productData.manufacturer, category: productData.category });
    }
  });
});


// API for deleting a specific product by ID
app.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);

  // Step 1: First, find the product by ID to get its name before deletion
  const query = 'SELECT name FROM products WHERE id = ?';
  
  db.query(query, [productId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error finding product' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const productName = result[0].name;

    // Step 2: Delete the product from the hashmap first
    if (productHashMap[productName]) {
      delete productHashMap[productName];
      console.log("Product Hashmap after deleting product", productHashMap);
      console.log(`Removed product from hashmap: ${productName}`);
    } else {
      return res.status(404).json({ message: 'Product not found in hashmap' });
    }

    // Step 3: Delete the inventory record corresponding to the product
    const deleteInventoryQuery = 'DELETE FROM inventory WHERE product_id = ?';
    
    db.query(deleteInventoryQuery, [productId], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error deleting product from inventory' });
      }

      // Step 4: Proceed to delete the product from the database
      const deleteProductQuery = 'DELETE FROM products WHERE id = ?';
      
      db.query(deleteProductQuery, [productId], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error deleting product from database' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Product not found in database' });
        }

        res.json({ message: 'Product deleted successfully from both hashmap and database' });
      });
    });
  });
});



app.get('/productsuggestions', (req, res) => {
  // Get the query parameter from the request
  const searchTerm = req.query.query; // Get the search term from the query string
  const qy = "SELECT name FROM products WHERE name LIKE ?"; // Use a placeholder for the query

  // Add wildcards to the search term
  const searchQuery = `%${searchTerm}%`;

  // Execute the query with the search term
  db.query(qy, [searchQuery], (err, result) => {
    if (err) {
      console.error(err); // Log the error for debugging
      res.status(500).send(err); // Send error response
    } else {
      res.json(result); // Send results as JSON
    }
  });
});

app.get('/inventory', (req, res) => {
  const query = `
    SELECT 
      p.name AS productName, 
      p.price, 
      i.quantity_available AS availableItems, 
      i.on_sale AS onSale, 
      i.rebate AS rebateAmount 
    FROM 
      inventory i 
    JOIN 
      products p ON i.product_id = p.id
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching inventory data:', err);
      return res.status(500).json({ error: 'Error fetching data' });
    }
    res.json(results);
  });
});

app.get('/sales', (req, res) => {
  const query = `
    SELECT p.id, p.name AS productName, p.price AS productPrice, COUNT(oi.product_id) AS itemsSold
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    GROUP BY p.id
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching sales data:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// API endpoint to get daily sales transactions
app.get('/daily-sales', (req, res) => {
  const query = `
    SELECT 
      DATE(created_at) AS saleDate, 
      SUM(total_amount) AS totalSales, 
      SUM(quantity) AS totalItemsSold
    FROM 
      orders
    GROUP BY 
      saleDate
    ORDER BY 
      saleDate;
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching daily sales data:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json(results);
  });
});

app.get('/search', (req, res) => {
  const { query } = req.query;

  // Sanitize the input to prevent SQL injection
  const sanitizedQuery = query.replace(/'/g, "''");

  // SQL query to search for products matching the query
  const sql = `
    SELECT * FROM products
    WHERE name LIKE '%${sanitizedQuery.split('%20').join(' ')}%'`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
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
    INSERT INTO orders (user_id, customer_name, address, street, city, state, zip_code, delivery_option, total_amount, confirmation_number, delivery_date, store_id, credit_card_number, shippingCost, discount, quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(insertOrderQuery, [
    userId,
    customerDetails.name,
    customerDetails.address,
    customerDetails.street,   // New street field
    customerDetails.city,     // New city field
    customerDetails.state,    // New state field
    customerDetails.zipCode,  // New zip code field
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
  let query = 'SELECT orders.*, order_items.product_id, order_items.price, products.name AS product_name, ' +
              'orders.street, orders.city, orders.state, orders.zip_code ' + // Include additional fields
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
      const { id, customer_name, address, street, city, state, zip_code, delivery_option, total_amount, confirmation_number, delivery_date, product_id, product_name, price, discount } = row;
      if (!acc[id]) {
        acc[id] = {
          id,
          customer_name,
          address,
          street,
          city,
          state,
          zip_code,
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


// Endpoint to add a new order
app.post('/orders', (req, res) => {
  const { customer_name, address, street, city, state, zip_code, delivery_option, total_amount, credit_card_number, shippingCost, discount, quantity, product_id } = req.body;
  const sql = 'INSERT INTO orders (customer_name, address, street, city, state, zip_code, delivery_option, total_amount, credit_card_number, shippingCost, discount, quantity, product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [customer_name, address, street, city, state, zip_code, delivery_option, total_amount, credit_card_number, shippingCost, discount, quantity, product_id], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to create order.' });
      }
      res.status(201).json({ message: 'Order created successfully!', orderId: results.insertId });
  });
});

// // Endpoint to update an existing order
// app.put('/orders/:orderId', (req, res) => {
//   const { orderId } = req.params;
//   const { customer_name, address, delivery_option, total_amount, credit_card_number, shippingCost, discount, quantity, product_id } = req.body;
//   const sql = 'UPDATE orders SET customer_name = ?, address = ?, delivery_option = ?, total_amount = ?, credit_card_number = ?, shippingCost = ?, discount = ?, quantity = ?, product_id = ? WHERE id = ?';
//   db.query(sql, [customer_name, address, delivery_option, total_amount, credit_card_number, shippingCost, discount, quantity, product_id, orderId], (err, results) => {
//       if (err) {
//           console.error(err);
//           return res.status(500).json({ message: 'Failed to update order.' });
//       }
//       res.status(200).json({ message: 'Order updated successfully!' });
//   });
// });

app.put('/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const {
    customer_name,
    address,
    street,
    city,
    state,
    zip_code,
    delivery_option,
    total_amount,
    credit_card_number,
    shippingCost,
    discount,
    delivery_date,
    product_id // Optional field
  } = req.body;

  // Update the orders table
  const orderQuery = `
    UPDATE orders
    SET customer_name = ?, address = ?, street = ?, city = ?, state = ?, zip_code= ?, delivery_option = ?, total_amount = ?, 
        credit_card_number = ?, shippingCost = ?, discount = ?, delivery_date = ?
    WHERE id = ?`;

  db.query(orderQuery, [
    customer_name,
    address,
    street,
    city,
    state,
    zip_code,
    delivery_option,
    total_amount,
    credit_card_number || null,
    shippingCost || null,
    discount || null,
    delivery_date || null,
    orderId
  ], (err, result) => {
    if (err) {
      console.error('Error updating order:', err);
      return res.status(500).send(err);
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Order not found');
    }

    // Update order_items table if product_id is provided
    if (product_id) {
      const itemQuery = `
        UPDATE order_items
        SET product_id = ?
        WHERE order_id = ?`;

      db.query(itemQuery, [product_id, orderId], (err, itemResult) => {
        if (err) {
          console.error('Error updating order_items:', err);
          return res.status(500).send(err);
        }

        if (itemResult.affectedRows === 0) {
          return res.status(404).send('No items found for this order');
        }

        res.json({ message: 'Order and order items updated successfully' });
      });
    } else {
      res.json({ message: 'Order updated successfully, no item changes made' });
    }
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

// Existing imports and connection setup remain unchanged...

// API for fetching all customers
app.get('/customers', (req, res) => {
  const query = 'SELECT * FROM users WHERE role = "customer"';
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

// API for creating a new customer
app.post('/create-customer', (req, res) => {
  const { username, password } = req.body;

  // Insert the new customer into the database
  const insertQuery = 'INSERT INTO users (username, password, role) VALUES (?, ?, "customer")';
  db.query(insertQuery, [username, password], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(201).json({ message: 'Customer created successfully', id: result.insertId });
  });
});

// API for updating a specific customer by ID
app.put('/customers/:id', (req, res) => {
  const customerId = parseInt(req.params.id);
  const { username, password } = req.body;
  
  const query = 'UPDATE users SET username = ?, password = ? WHERE id = ? AND role = "customer"';
  
  db.query(query, [username, password, customerId], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.affectedRows === 0) {
      res.status(404).send('Customer not found');
    } else {
      res.json({ id: customerId, username });
    }
  });
});

// API for deleting a specific customer by ID
app.delete('/customers/:id', (req, res) => {
  const customerId = req.params.id;

  const query = 'DELETE FROM users WHERE id = ? AND role = "customer"';
  
  db.query(query, [customerId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error deleting customer' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json({ message: 'Customer deleted successfully' });
  });
});

// API endpoint for top 5 store locations
app.get('/top-store-locations', (req, res) => {
  const query = `
    SELECT s.StoreID, s.Street, s.City, s.State, s.ZipCode, SUM(o.quantity) AS total_products
    FROM StoreLocations s
    JOIN orders o ON s.StoreID = o.store_id
    GROUP BY s.StoreID
    ORDER BY total_products DESC
    LIMIT 5;
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching top store locations:', err);
      return res.status(500).json({ error: 'Failed to fetch top store locations' });
    }
    
    // Format the result if needed, or send it directly
    const topStoreLocations = result.map(row => ({
      storeId: row.StoreID,
      street: row.Street,
      city: row.City,
      state: row.State,
      zipCode: row.ZipCode,
      totalOrders: row.total_products,
    }));

    res.json(topStoreLocations);
  });
});

// Define the API route to get the top 5 sold products
app.get('/api/top-sold-products', (req, res) => {
  const query = `
    SELECT p.id, p.name, p.price, p.image, p.manufacturer, p.category, COUNT(oi.product_id) AS total_sold
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY oi.product_id, p.name
    ORDER BY total_sold DESC
    LIMIT 5;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results);
  });
});

app.post('/customer-service/tickets', upload.single('image'), (req, res) => {
  const { description } = req.body;
  const image = req.file;

  if (!description || !image) {
    return res.status(400).json({ message: 'Description and image are required' });
  }

  // Generate a unique 4-digit ticket ID
  //const ticketId = Math.floor(1000 + Math.random() * 9000).toString();
  const ticketId = uuidv4();

  // Save the ticket data in your MySQL database
  const query = 'INSERT INTO tickets (ticket_id, description, image_path) VALUES (?, ?, ?)';
  db.query(query, [ticketId, description, image.path], (err) => {
    if (err) {
      console.error('Error creating ticket:', err);
      return res.status(500).json({ message: 'Error creating ticket' });
    }

    res.status(201).json({
      message: 'Ticket created successfully',
      ticketId: ticketId
    });
  });
});

const imageToBase64 = require('image-to-base64');

app.get('/customer-service/tickets/:ticketId', async (req, res) => {
  const ticketId = req.params.ticketId;

  // Check if ticket exists
  const queryCheckTicket = 'SELECT * FROM tickets WHERE ticket_id = ?';
  db.query(queryCheckTicket, [ticketId], (err, result) => {
    if (err) {
      console.error('Error fetching ticket:', err);
      return res.status(500).json({ message: 'Error retrieving ticket' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const ticket = result[0];
    const imagePath = path.join(__dirname, ticket.image_path);

    // Check if a decision already exists in ticketstatuses
    const queryCheckStatus = 'SELECT decision, justification FROM ticketstatuses WHERE ticket_id = ?';
    db.query(queryCheckStatus, [ticket.ticket_id], async (err, statusResult) => {
      if (err) {
        console.error('Error checking ticket status:', err);
        return res.status(500).json({ message: 'Error checking ticket status' });
      }

      // If a decision exists, return it
      if (statusResult.length > 0) {
        return res.json({
          decision: statusResult[0].decision,
          justification: statusResult[0].justification,
        });
      }

      // If no decision exists, generate one using OpenAI
      try {
        const prompt = `Decide if the shipment with the following description and image is eligible for:
                - "refund_order"
                - "replace_order"
                - "escalate_to_human_agent"

                  Please respond in JSON format as:
                  {
                    "decision": "<refund_order|replace_order|escalate_to_human_agent>",
                    "justification": "<brief justification based on description and image, mentioning alignment with description>"
                  }

                  Criteria for decision:
                  1. If the customer states the product is damaged and the image confirms damage, respond with "replace_order" or "refund_order" based on customer preference.
                  2. If the image appears fine but the customer claims damage, respond with "escalate_to_human_agent" for further verification.
                  3. If the image does not match the customer report (e.g., the box is intact, but the customer claims it is damaged), respond with "escalate_to_human_agent" to verify discrepancies.
                  4. If the product is not functioning as described (e.g., the customer reports it doesn't work, and the image shows it as intact), respond with "escalate_to_human_agent".
                  5. If the customer states they want a refund and the image confirms the product is indeed damaged, respond with "refund_order".
                  6. If the customer does not mention a return or refund, evaluate the image and description and choose the best decision based on whether the product is damaged, functioning correctly, or requires further investigation.

                  Description given by customer: ${ticket.description}`;

        imageToBase64(imagePath) // Convert the image to base64
          .then(async (base64img) => {
            try {
              const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "text", text: prompt },
                      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64img}` } }
                    ]
                  }
                ]
              });

              // Parse the JSON response
              const assistantMessage = response.choices[0].message.content.trim();
              const assistantMessageClean = assistantMessage.replace(/```json|```/g, '');
              const { decision, justification } = JSON.parse(assistantMessageClean);

              // Store the decision and justification in ticketstatuses
              const queryInsertStatus = 'INSERT INTO ticketstatuses (ticket_id, decision, justification) VALUES (?, ?, ?)';
              db.query(queryInsertStatus, [ticket.ticket_id, decision, justification], (err) => {
                if (err) {
                  console.error('Error saving decision:', err);
                  return res.status(500).json({ message: 'Error saving decision' });
                }

                res.json({ decision, justification });
              });
            } catch (error) {
              console.error('Error with OpenAI API or parsing response:', error);
              res.status(500).json({ message: 'Error processing response' });
            }
          })
          .catch((error) => {
            console.error('Error converting image to base64:', error);
            res.status(500).json({ message: 'Error processing image' });
          });
      } catch (error) {
        console.error('Error generating decision with OpenAI:', error);
        res.status(500).json({ message: 'Error generating decision' });
      }
    });
  });
});


app.get('/customer-service/tickets', (req, res) => {
  const query = 'SELECT ticket_id, description, image_path FROM tickets';

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching tickets:', error);
      return res.status(500).json({ message: 'Error retrieving tickets' });
    }
    //console.log('results', results);
    res.json(results);
  });
});

app.delete('/customer-service/tickets/:ticketId', (req, res) => {
  const ticketId = req.params.ticketId;

  // First, retrieve the image path for the ticket
  const selectSql = 'SELECT image_path FROM tickets WHERE ticket_id = ?';
  db.query(selectSql, [ticketId], (err, results) => {
    if (err) {
      console.error('Error fetching ticket image path: ', err);
      return res.status(500).json({ error: 'Failed to delete ticket' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const imagePath = results[0].image_path;

    // Delete the ticket from the database
    const deleteSql = 'DELETE FROM tickets WHERE ticket_id = ?';
    db.query(deleteSql, [ticketId], (deleteErr, result) => {
      if (deleteErr) {
        console.error('Error deleting ticket: ', deleteErr);
        return res.status(500).json({ error: 'Failed to delete ticket' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Delete the image file from the filesystem
      fs.unlink(imagePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting image file:', unlinkErr);
          return res.status(500).json({ error: 'Failed to delete image file' });
        }

        res.status(200).json({ message: 'Ticket and associated image deleted successfully' });
      });
    });
  });
});


/* -------- Server Port Declaration --------    */

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



/* -------- MONGODB --------    */


const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Connect to MongoDB
client.connect(err => {
  if (err) {
    console.error('MongoDB connection error:', err);
    return;
  }
  console.log('Connected to MongoDB');
});

const reviewsCollection = client.db('smart-home').collection('reviews');

// API for submitting a review
app.post('/reviews', async (req, res) => {
  const reviewData = req.body;

  try {
    const result = await reviewsCollection.insertOne(reviewData);
    res.status(201).json({
      message: 'Review submitted successfully',
      reviewId: result.insertedId
    });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ message: 'Error submitting review' });
  }
});

app.get('/reviews/:productId', async (req, res) => {
  //console.log('Fetching reviews for product ID:', req.params.productId);
  const productId = parseInt(req.params.productId, 10); // Ensure it's treated as a number

  try {
      const reviews = await reviewsCollection.find({ productId }).toArray();
      //console.log('Retrieved Reviews:', reviews); // Debugging line
      if (reviews.length === 0) {
          return res.status(404).json({ message: 'No reviews found for this product' });
      }
      res.status(200).json(reviews);
  } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// API endpoint to get trending products
// API endpoint to get trending products
app.get('/trending', async (req, res) => {
  try {
    // Step 1: Fetch average product ratings from MongoDB
    const trendingProducts = await reviewsCollection.aggregate([
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: { $toDouble: "$reviewRating" } },
        },
      },
      {
        $sort: { averageRating: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
        },
      },
    ]).toArray();  // Ensure you convert the cursor to an array

    // Check if trendingProducts is empty
    if (trendingProducts.length === 0) {
      return res.json({ message: "No trending products found.", products: [] }); // Send an empty array instead of 404
    }

    // Extract product IDs from the results
    const productIds = trendingProducts.map(product => product.productId);

    // Step 2: Fetch product details from MySQL based on product IDs
    // Use parameterized query to prevent SQL injection
    //const placeholders = productIds.map(() => '?').join(',');
    //const query = `SELECT * FROM products WHERE id IN (${placeholders})`;
    const placeholders = productIds.map(() => '?').join(',');
    const fieldOrder = productIds.map(id => `'${id}'`).join(','); // Prepare IDs for FIELD()
    const query = `SELECT * FROM products WHERE id IN (${placeholders}) ORDER BY FIELD(id, ${fieldOrder})`;

    db.query(query, productIds, (error, results) => {
      if (error) {
        console.error('Error fetching products from MySQL:', error);
        return res.status(500).json({ message: "Error fetching products from MySQL." });
      }
      
      // Send the product records as response
      res.json(results);
    });
  } catch (error) {
    console.error('Error fetching trending products:', error);
    res.status(500).json({ message: "Server error." }); // Return JSON response
  }
});
