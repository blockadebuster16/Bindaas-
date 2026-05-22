# eCommerce Admin Dashboard Backend API

This document details the setup instructions and REST API endpoints for the newly implemented Admin functionality.

## Project Setup

### Environment Variables (`.env`)
To run this project, make sure to add an `.env` file to your `server` directory.

Create `server/.env` based on the configuration required:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/your-db-name
CLIENT_URL=http://localhost:3000
```
*(Replace the `<username>`, `<password>`, and `your-db-name` with your actual MongoDB Atlas connection string).*

### Starting the Servers

To start the backend server:
```bash
cd server
npm i        # To ensure all deps are loaded
npm run dev  # Starts the server using nodemon
```
To start the React frontend:
```bash
cd client
npm start    # Typically running on localhost:3000
```


## API Endpoints

The backend supports full CRUD operations on Products via `/api/products`.

### 1. Retrieve All Products
- **URL**: `/api/products`
- **Method**: `GET`
- **Description**: Returns a list of all products in the database.
- **Success Response Code**: `200 OK`

### 2. Retrieve Specific Product
- **URL**: `/api/products/:id`
- **Method**: `GET`
- **URL Params**: `id=[string]` where `id` is the MongoDB ObjectId.
- **Description**: Returns details for a single product.
- **Success Response Code**: `200 OK`
- **Error Response Code**: `404 Not Found`

### 3. Create a New Product (Admin)
- **URL**: `/api/products`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "name": "Luxury Timepiece",
    "description": "An exquisite watch with a beautiful finish.",
    "price": 1499.99,
    "category": "Watches",
    "stock": 25,
    "imageUrl": "https://example.com/watch.jpg"
  }
  ```
- **Description**: Creates a new product in the database. Requires `name` and `price`.
- **Success Response Code**: `201 Created`

### 4. Update an Existing Product (Admin)
- **URL**: `/api/products/:id`
- **Method**: `PUT`
- **URL Params**: `id=[string]`
- **Payload**: Provide any subset of the product fields to be updated.
  ```json
  {
    "price": 1299.99,
    "stock": 10
  }
  ```
- **Description**: Updates an existing product completely matched by `id`.
- **Success Response Code**: `200 OK`

### 5. Delete a Product (Admin)
- **URL**: `/api/products/:id`
- **Method**: `DELETE`
- **URL Params**: `id=[string]`
- **Description**: Deletes an existing product permanently.
- **Success Response Code**: `200 OK`

---

## Administrator Access

To manage the catalog securely, an Admin authentication flow has been implemented via JWT passing through authorization headers. 

Use the following default credentials to log in at `http://localhost:3000/admin-login` (if you haven't set up custom credentials yet):

- **Admin Email:** `admin@bindass.com`
- **Admin Password:** `secretadmin123`

*(These defaults are configured dynamically but can act as the fallback if no admin exists in the database. You can securely override the fallback by setting `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_JWT_SECRET` in your server's `.env` file!)*

### Creating Custom Credentials / Password Reset
You have full control over your admin access. From the Login Portal, simply click **"Forgot or Setup Credentials?"** to securely migrate to your own credentials. Our robust backend will update the database seamlessly, provided you input the original Setup/Master Email (defaulting to `admin@bindass.com` unless overridden in `.env`).

- **Endpoint:** `POST /api/auth/admin-reset`
- **Request Body:** `{ predefinedEmail, newEmail, newPassword }`
- **Response:** Clears previous entries and establishes your new, secured administrative account.
