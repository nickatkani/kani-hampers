# 🌟 MongoDB Atlas Setup Guide

## Step-by-Step Atlas Configuration

### 1. Create Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Verify your email

### 2. Create a New Project

1. Click **New Project**
2. Name it "Kani Hampers" or similar
3. Add yourself as project owner

### 3. Create a Cluster

1. Click **Build a Database**
2. Choose **M0 Sandbox** (Free tier)
3. Select **AWS**, **Google Cloud**, or **Azure**
4. Choose region closest to you
5. Name your cluster (e.g., "kani-cluster")
6. Click **Create**

### 4. Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `kani-admin` (or your choice)
5. Password: Generate a secure password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### 5. Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Choose **Add Current IP Address** or **Allow Access from Anywhere**
   - For development: Use "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Use specific IP addresses
4. Click **Confirm**

### 6. Get Connection String

1. Go to **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Node.js** driver
5. Copy the connection string

It will look like:

```
mongodb+srv://kani-admin:<password>@kani-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 7. Update Your Configuration

Replace the connection string in both `.env` files:

**Main `.env` file:**

```env
MONGODB_URI=mongodb+srv://kani-admin:YOUR_PASSWORD@kani-cluster.xxxxx.mongodb.net/kani-hampers?retryWrites=true&w=majority
```

**Server `.env` file:**

```env
MONGODB_URI=mongodb+srv://kani-admin:YOUR_PASSWORD@kani-cluster.xxxxx.mongodb.net/kani-hampers?retryWrites=true&w=majority
```

⚠️ **Important:** Replace `<password>` with your actual password!

### 8. Test the Connection

```bash
cd server
npm run test-connection
```

You should see:

```
✅ Successfully connected to MongoDB Atlas!
📊 Found 0 collections: []
✅ Test write successful: ObjectId(...)
🧹 Cleaned up test document
🔗 Connection closed
```

### 9. Seed Your Database

```bash
cd server
npm run seed
```

### 10. Start Your Application

```bash
# From the root directory
npm run start:full
```

## 🔧 Troubleshooting

### Authentication Failed

- Double-check username and password
- Make sure you're using the database user (not Atlas login)
- Verify the password doesn't contain special characters that need URL encoding

### Network Timeout

- Check your IP is whitelisted in Network Access
- Try adding 0.0.0.0/0 (allow all) temporarily

### Cannot Connect

- Verify your internet connection
- Check if your firewall blocks MongoDB connections
- Ensure the cluster is running (not paused)

## 🌍 Atlas Benefits

✅ **Global Distribution** - Data centers worldwide
✅ **Automatic Backups** - Point-in-time recovery
✅ **Monitoring** - Real-time performance metrics
✅ **Security** - Enterprise-grade security
✅ **Scaling** - Easy vertical and horizontal scaling
✅ **Free Tier** - 512MB storage, perfect for development

## 📊 Monitoring Your Database

1. Go to your Atlas dashboard
2. Click on your cluster
3. View real-time metrics:
   - Operations per second
   - Network traffic
   - Storage usage
   - Query performance

## 🔐 Security Best Practices

1. **Use strong passwords** for database users
2. **Limit IP access** in production
3. **Use connection string secrets** (don't commit to git)
4. **Enable two-factor authentication** on Atlas account
5. **Regularly rotate passwords**

## 💡 Next Steps

Once connected:

1. Explore the Atlas dashboard
2. Set up monitoring alerts
3. Consider enabling backups for production
4. Review security recommendations
