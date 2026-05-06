# Masion API - Advanced E-Commerce Backend

A robust, scalable, and feature-rich E-Commerce REST API built with Node.js, Express, and MongoDB. This application provides a complete backend solution for modern e-commerce platforms, including payment processing, real-time chat, AI integration, and comprehensive inventory management.

## 🚀 Key Features

### User Management & Authentication
*   **JWT Authentication**: Secure user login and registration using JSON Web Tokens.
*   **Role-Based Access Control**: Different access levels for `Users` and `Admins`.
*   **Password Management**: Secure password hashing with `bcryptjs` and password reset functionality via email.
*   **Profile Management**: Users can manage multiple shipping addresses and their personal profiles.

### Product & Inventory Management
*   **Comprehensive Catalog**: Full support for Products, Categories, Subcategories, and Brands.
*   **Media Management**: Product image uploads directly integrated with Cloudinary for optimized storage and delivery.
*   **Advanced Filtering & Search**: Powerful API features for filtering, sorting, field limiting, and pagination.

### Shopping Cart & Checkout
*   **Dynamic Cart**: Apply coupons, track item quantities, and auto-calculate totals.
*   **Wishlist**: Users can save favorite products for later.
*   **Dual Payment Options**: 
    *   Cash on Delivery (COD) processing.
    *   Online Credit Card payments powered by **Stripe Checkout** & Webhooks.

### Advanced Capabilities
*   **Real-time Chat**: Live customer support or user-to-user chat powered by `Socket.io`.
*   **AI Integration**: Integrated with Google Gemini AI (`@google/generative-ai`) for smart recommendations or automated support.
*   **Email Notifications**: Transactional emails sent via `nodemailer`.
*   **Reviews & Ratings**: Users can leave verified reviews and rate products.

## 🛠️ Technology Stack

*   **Runtime**: Node.js
*   **Framework**: Express.js 5.x
*   **Database**: MongoDB (via Mongoose ODM)
*   **Authentication**: JSON Web Token (JWT) & bcryptjs
*   **Payments**: Stripe API
*   **File Uploads**: Multer & Cloudinary
*   **Real-time**: Socket.io
*   **AI**: Google Generative AI (Gemini)
*   **Code Quality**: ESLint & Prettier

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ahmed441abdallah/masion-api-.git
   cd masion-api-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add the following configuration:
   ```env
   PORT=3000
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   
   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email Service (Nodemailer)
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_app_password
   
   # AI Integration
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Seed Database (Optional):**
   To populate your database with dummy data for testing:
   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   # Development mode (with nodemon)
   npm run start
   ```

## 🔌 API Endpoints Overview

*   `/api/users` - User registration, login, and profile management
*   `/api/products` - Product catalog and filtering
*   `/api/categories` - Category management
*   `/api/brands` - Brand management
*   `/api/cart` - User shopping cart operations
*   `/api/orders` - Order placement and tracking
*   `/api/reviews` - Product reviews
*   `/api/coupons` - Discount code management
*   `/api/wishlist` - User wishlist operations
*   `/api/chat` - Real-time chat history and endpoints

## 💳 Testing Stripe Webhooks Locally
To test the Stripe payment webhooks in your local environment, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/webhook-checkout
```
*Note: Make sure to update your `.env` with the webhook secret provided by the CLI.*

## 🔒 Security Measures
*   Passwords hashed before saving to the database.
*   API routes protected by JWT middleware.
*   Admin-only routes secured with role validation.
*   Stripe signatures validated on all webhook events.

## 📄 License
This project is licensed under the ISC License.
