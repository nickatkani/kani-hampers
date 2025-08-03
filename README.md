# KANI Gift Hampers

A beautiful e-commerce platform for personalized Rakhi hampers and gifts.

## Features

- 🎁 Choose from different hamper types (Normal, Silver, Gold)
- 📸 Upload childhood photos for personalization
- 💌 Add personal messages
- 🧵 Select additional handcrafted rakhis
- ✨ Add special add-ons
- 🛒 Complete shopping cart experience
- 📱 Responsive design with beautiful UI
- 👨‍💼 Admin dashboard for order management
- 💳 Razorpay payment integration
- 🗄️ MongoDB Atlas database

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run preview` - Previews the production build
- `npm run lint` - Runs ESLint

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

## Project Structure

```
src/
  ├── App.tsx          # Main application component
  ├── main.tsx         # Application entry point
  └── index.css        # Global styles with Tailwind
```

## Features in Detail

### Hamper Customization

- Multiple hamper tiers with different price points
- Step-by-step customization process
- Photo upload functionality
- Personal message input

### Product Selection

- Handcrafted rakhi selection
- Add-on products
- Quantity management
- Real-time cart updates

### Responsive Design

- Mobile-first approach
- Beautiful gradient backgrounds
- Smooth animations and transitions
- Professional typography

## Future Enhancements

- Payment gateway integration
- Order tracking with real logistics partners
- User authentication and customer accounts
- Product reviews and ratings
- Advanced analytics and reporting
- Email notifications for order updates
- Real-time order status updates
- Inventory management

## Admin Dashboard

The application includes a comprehensive admin dashboard for managing orders and business operations.

### 🔐 Admin Access

- Click the shield icon in the bottom-right corner of the website
- Enter the admin password: `admin123`
- Access the full admin dashboard

### 📊 Dashboard Features

**Overview Dashboard:**

- Total orders count and revenue statistics
- Pending and delivered orders tracking
- Recent orders quick view
- Real-time business metrics
- Quick access to product management
- Export all orders to CSV

**Order Management:**

- View all customer orders in a comprehensive table
- Search orders by customer name, order ID, or email
- Filter by order status (pending, processing, shipped, delivered, cancelled)
- Filter by date (today, this week, all time)
- Update order status directly from the list
- Delete orders with confirmation
- Export individual orders to PDF

**Detailed Order View:**

- Complete customer information (name, email, phone, address)
- Order status and payment tracking
- Hamper details with personalization
- View uploaded childhood photos
- Read personal messages
- See additional rakhis and add-ons
- Tracking number and delivery information
- Total amount breakdown
- Export order receipt/LR to PDF

**Product Management:**

- View all products (hampers, rakhis, add-ons) in a visual grid
- Add new products with detailed information
- Edit existing product details and pricing
- Delete products with confirmation
- Manage product categories and stock status
- Track product popularity metrics

### 🛠️ Admin Capabilities

**Order Status Management:**

- Change status: Pending → Processing → Shipped → Delivered
- Mark orders as cancelled if needed
- Real-time status updates

**Product Management:**

- Add new hampers, rakhis, and add-ons
- Update product names, prices, and descriptions
- Manage product categories (hamper/rakhi/addon)
- Toggle stock availability
- Track popularity metrics

**Customer Information:**

- Complete contact details
- Delivery addresses
- Order history per customer

**Export & Reporting:**

- Export all orders to CSV format
- Export individual order receipts to PDF
- Generate LR (Logistics Receipt) documents
- Order analytics and trends
- Revenue tracking

**Security:**

- Password-protected admin access
- Session management
- Clear admin mode indication

### 📱 Responsive Admin Interface

The admin dashboard is fully responsive and works on:

- Desktop computers (full feature set)
- Tablets (optimized layout)
- Mobile devices (touch-friendly interface)

### 🎨 Admin UI Features

- Clean, modern interface
- Intuitive navigation between sections
- Status indicators with color coding
- Quick action buttons (view, edit, delete, export)
- Real-time updates
- Mobile-first responsive design
- Visual product management with images
- Form validation and error handling

### 📄 PDF Export Features

**Order Receipts:**

- Professional PDF receipts for each order
- Complete order details and customer information
- Itemized breakdown of hampers, rakhis, and add-ons
- Personal messages included
- Company branding and formatting

**CSV Export:**

- Bulk export of all orders
- Includes customer details, order totals, and status
- Perfect for accounting and analytics
- Date-stamped file names

## 🔥 Firebase Integration

The application now uses **Firebase** as the backend service for real data persistence:

### 🗄️ **Database & Storage**

- **Firestore Database**: Stores orders, products, and customer data
- **Firebase Storage**: Handles photo uploads and file storage
- **Real-time Updates**: Automatic syncing between admin and customer views
- **Serverless Architecture**: No backend server required

### 🔧 **Firebase Features Used**

- **Authentication**: Ready for user login/signup (admin implemented)
- **Cloud Firestore**: NoSQL database for orders and products
- **Cloud Storage**: File uploads for customer photos
- **Analytics**: Track user behavior and app performance
- **Auto-scaling**: Handles traffic spikes automatically

### ⚠️ **Important: Firebase Storage Configuration**

For photo uploads to work properly, you need to configure Firebase Storage security rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `kani-hampers`
3. Navigate to **Storage** → **Rules**
4. Update the rules to allow uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // For development only
    }
  }
}
```

**For production**, use more restrictive rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{fileName} {
      allow read: if true;
      allow write: if request.resource.size < 10 * 1024 * 1024 // 10MB limit
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

**Note**: If Firebase Storage is not configured, the app will fall back to local photo preview for development purposes.

### 📊 **Data Structure**

```
kani-hampers (Firebase Project)
├── orders/          # Customer orders collection
├── products/        # Products and hampers collection
├── rakhis/          # Rakhi catalog
└── users/           # Customer data (future use)
```

### 🚀 **Production Ready**

- Real database persistence
- Automatic data backup
- Scalable architecture
- Mobile-responsive design
- Cross-platform compatibility

---

Made with ❤️ by KANI Team
