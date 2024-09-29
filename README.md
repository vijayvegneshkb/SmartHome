
# Smart Home Project - Database and Application Setup

This document provides a guide on setting up the **MySQL** and **MongoDB** databases, as well as running the React application and backend server. Follow the steps below to install, configure, and use the project.

## Table of Contents
1. [MySQL Setup](#mysql-setup)
   - [Prerequisites](#prerequisites)
   - [Importing the MySQL Database](#importing-the-mysql-database)
2. [MongoDB Setup](#mongodb-setup)
   - [Prerequisites](#prerequisites)
   - [Importing the MongoDB Database](#importing-the-mongodb-database)
3. [Running the Application](#running-the-application)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
4. [Configuring the Project](#configuring-the-project)

---

## MySQL Setup

### Prerequisites
Before importing the MySQL database, ensure you have the following installed:
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)

### Importing the MySQL Database

1. Open **MySQL Workbench** and connect to your MySQL instance.
2. Go to the **Administration** tab on the left, and select **Data Import/Restore**.
3. Under **Import Options**, select **"Import from Self-Contained File"**.
   - Select the provided `.sql` file, e.g., `smarthomeDB.sql`.
4. In the **Default Target Schema**, either select an existing schema or create a new one.
5. Click **Start Import**.
6. Once the import is complete, verify that the tables and data are visible under the `smarthomes_db` schema.

The MySQL database contains the following tables:
- `orders`
- `order_items`
- `products`
- `storelocations`
- `users`

---

## MongoDB Setup

### Prerequisites
Make sure you have the following installed:
- [MongoDB Server](https://www.mongodb.com/try/download/community)
- [MongoDB Compass](https://www.mongodb.com/products/compass) (optional, for UI-based interaction)

### Importing the MongoDB Database

#### Using MongoDB Compass
1. Open **MongoDB Compass** and connect to your local MongoDB instance.
2. In the left sidebar, select or create the `smart-home` database.
3. Select the **reviews** collection, or create it if it doesn't exist.
4. Click the **Import Data** button at the top right.
5. Choose the `.json` file, select **JSON** as the file type, and import the data into the `reviews` collection.



---

## Running the Application

To run the application, you need to run the frontend and backend separately.

### Backend Setup

1. Open a terminal and navigate to the `smart-home/backend` folder:
   ```bash
   cd smart-home/backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   node server.js
   ```

### Frontend Setup

1. Open another terminal and navigate to the `smart-home` folder:
   ```bash
   cd smart-home
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the React frontend:
   ```bash
   npm start
   ```

### Accessing the Application
- Once both the backend and frontend servers are running, open a browser and navigate to:
  ```bash
  http://localhost:3000/
  ```

---

## Configuring the Project

### MySQL Configuration
1. Open the project in your code editor.
2. Find the **MySQL connection** configuration file, located in the backend folder (`server.js`).
3. Update the connection details:
   ```javascript
   const db = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin',
      database: 'smarthomes_db'
   });
   ```

---

## Additional Notes

- Ensure that both **MySQL** and **MongoDB** servers are running before starting the application.
- If you need to reset the databases, follow the import instructions again for **MySQL** and **MongoDB**.
- The backend must be running on `localhost:5000`  for API requests to work correctly from the frontend.

Feel free to reach out for further assistance or queries.
