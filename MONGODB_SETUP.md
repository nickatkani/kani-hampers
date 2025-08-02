# MongoDB Migration Setup

## 🔄 Migration from Firebase to MongoDB

This guide will help you set up MongoDB to replace Firebase in your Kani Hampers project.

## 📋 Prerequisites

1. **MongoDB** installed locally OR **MongoDB Atlas** account
2. **Node.js** and **npm** installed

## 🚀 Setup Instructions

### Step 1: Install MongoDB (Choose one option)

#### Option A: Local MongoDB

```bash
# Windows (using chocolatey)
choco install mongodb

# macOS (using homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 3: Configure Environment Variables

Edit `server/.env` file:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/kani-hampers

# For MongoDB Atlas (replace with your connection string)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kani-hampers

PORT=5000
NODE_ENV=development
```

### Step 4: Install Frontend Dependencies

```bash
# In the root directory
npm install
```

### Step 5: Seed the Database

```bash
cd server
node seed.js
```

### Step 6: Start the Application

```bash
# Option 1: Start both frontend and backend together
npm run start:full

# Option 2: Start separately
# Terminal 1 (Backend)
cd server && npm run dev

# Terminal 2 (Frontend)
npm run dev
```

## 📊 Database Collections

Your MongoDB database will have these collections:

### `rakhis`

```json
{
  "_id": "ObjectId",
  "id": "kesar_bindu",
  "name": "Kesar Bindu",
  "category": "Traditional",
  "price": 150,
  "image": "/gallery/images/rakhi/kesar_bindu.jpg",
  "description": "Traditional rakhi with kesar and pearls"
}
```

### `addons`

```json
{
  "_id": "ObjectId",
  "id": "choco_ferrero",
  "name": "Ferrero Rocher",
  "price": 150
}
```

### `orders`

```json
{
  "_id": "ObjectId",
  "customerName": "John Doe",
  "email": "john@example.com",
  "hamperType": "silver",
  "hamperTitle": "Silver Hamper",
  "photos": ["url1", "url2"],
  "message": "Happy Raksha Bandhan!",
  "total": 551,
  "paymentId": "pay_xxxxx",
  "status": "pending",
  "createdAt": "2025-08-03T10:30:00Z"
}
```

## 🔌 API Endpoints

- `GET /api/rakhis` - Get all rakhis
- `GET /api/addons` - Get all addons
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id` - Get specific order
- `PATCH /api/orders/:id/status` - Update order status

## 🔧 What Changed

1. **Database**: Firebase Firestore → MongoDB
2. **Authentication**: Removed (add later if needed)
3. **File Storage**: Still using Cloudinary (you can change this too)
4. **API Calls**: Direct Firebase calls → REST API calls

## 🛡️ Security Benefits

- **No direct database access** from frontend
- **API-based architecture** with proper validation
- **Environment-based configuration**
- **Centralized error handling**

## 🎯 Next Steps

1. **Add Authentication**: Implement JWT-based auth
2. **Add Validation**: Use Joi or Zod for request validation
3. **Add Rate Limiting**: Prevent API abuse
4. **Add Logging**: Use Winston or similar
5. **Add Tests**: Unit and integration tests

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running (local)
sudo systemctl status mongod

# Start MongoDB (local)
sudo systemctl start mongod
```

### API Not Working

- Check if backend server is running on port 5000
- Verify proxy configuration in `vite.config.ts`
- Check network/firewall settings

### Data Not Loading

- Run the seed script again: `node server/seed.js`
- Check MongoDB connection string
- Verify database name in connection string
