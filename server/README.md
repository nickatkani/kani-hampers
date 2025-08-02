# KANI Hampers Backend

A Node.js backend API for the KANI Gift Hampers e-commerce application.

## Features
- MongoDB Atlas integration
- Admin authentication
- Order management
- Product management (Rakhis & Add-ons)
- Image upload with Cloudinary

## Environment Variables Required
```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

## Deployment
This backend is designed to be deployed on Render.com or similar Node.js hosting platforms.

## API Endpoints
- `GET /api/rakhis` - Get all rakhi products
- `GET /api/addons` - Get all addon products  
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (admin)
- `PATCH /api/orders/:id/status` - Update order status
- `POST /api/admin/login` - Admin authentication
- `POST /api/upload` - Image upload

## Local Development
```bash
npm install
npm start
```
