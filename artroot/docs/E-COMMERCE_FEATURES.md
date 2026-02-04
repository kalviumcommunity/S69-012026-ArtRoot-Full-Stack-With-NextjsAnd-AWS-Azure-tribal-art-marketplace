# ArtRoot E-Commerce Platform - Feature Documentation

## 🎨 Overview

ArtRoot has been transformed into a comprehensive e-commerce platform for tribal art, supporting both **buyers** and **artists** with complete workflows for browsing, purchasing, and selling artwork.

---

## 🆕 New Features Implemented

### 1. **Shopping Cart System**
- **Location**: `/contexts/CartContext.tsx`
- **Features**:
  - Add/remove items from cart
  - Update quantities
  - Persistent storage (localStorage)
  - Real-time cart count badge in navbar
  - Cart total calculation
  
- **Pages**:
  - Cart page: `/app/cart/page.tsx`
  - View all items, adjust quantities, proceed to checkout

### 2. **Artwork Gallery & Browsing**
- **Location**: `/app/artworks/page.tsx`
- **Features**:
  - Search by artwork title or artist name
  - Filter by tribe/style (Warli, Gond, Madhubani, etc.)
  - Filter by price range (Under ₹5K, ₹5K-₹20K, Above ₹20K)
  - Sort by newest, price low-to-high, price high-to-low
  - Responsive grid layout
  - Mobile-friendly filters

### 3. **Artwork Detail Page**
- **Location**: `/app/artworks/[id]/page.tsx`
- **Features**:
  - Full artwork details (title, description, price, tribe, medium, size)
  - High-quality image display
  - Add to cart button
  - Add to favorites button
  - Artist information
  - Availability status
  - Verification badge

### 4. **Checkout & Order Placement**
- **Location**: `/app/checkout/page.tsx`
- **Features**:
  - Delivery address form (name, email, phone, full address)
  - Order summary with item details
  - Cash on Delivery (COD) payment option
  - Order notes field
  - Creates individual orders for each artwork in cart
  - Success confirmation and redirect to dashboard

### 5. **Unified Dashboard**
- **Location**: `/app/dashboard/page.tsx`
- **Buyer Features**:
  - **My Orders Tab**: View order history with status tracking
  - **Favorites Tab**: Saved artworks wishlist
  - **Profile Tab**: View account information
  
- **Artist Features**:
  - **Sales Tab**: View all sales and orders received
  - **My Artworks Tab**: Manage uploaded artworks
  - **Upload New Button**: Quick access to artwork upload
  - **Profile Tab**: Artist profile information

### 6. **Artwork Upload (Artists)**
- **Location**: `/app/dashboard/upload/page.tsx`
- **Features**:
  - Upload form with title, description, price
  - Tribe/style selection dropdown
  - Medium selection (Acrylic, Oil, Watercolor, etc.)
  - Size specification
  - Image URL upload
  - Automatic verification pending status
  - Success confirmation and redirect

### 7. **Artist Profile Setup**
- **Location**: `/app/setup-artist/page.tsx`
- **Features**:
  - One-time profile setup for new artists
  - Tribe/art style selection
  - Location, years of experience
  - Specialties and biography
  - Auto-redirects if profile exists
  - Required before uploading artworks

### 8. **Enhanced Navigation**
- **Updated Navbar** (`/components/Navbar.tsx`):
  - Shopping cart icon with item count badge
  - Gallery link
  - Dashboard link (when logged in)
  - User icon for profile access
  - Mobile-responsive menu with cart access

### 9. **Enhanced Artwork Cards**
- **Updated Component** (`/components/ArtworkCard.tsx`):
  - Add to cart button (animated)
  - Visual feedback when added to cart
  - Quick view button
  - Availability badge
  - Clickable to artwork detail page

### 10. **Backend API Enhancements**
- **New Artist Routes** (`/backend/src/routes/artists.ts`):
  - `GET /api/artists/profile` - Get artist profile by user ID
  - `POST /api/artists/profile` - Create artist profile
  - `PUT /api/artists/profile` - Update artist profile
  - `GET /api/artists/:id` - Get public artist profile
  
- **Updated Favorites Route** (`/backend/src/routes/favorites.ts`):
  - `GET /api/favorites/my` - Get current user's favorites

---

## 🛣️ User Journeys

### **Buyer Journey**
1. **Discover** → Browse homepage or gallery (`/artworks`)
2. **Search & Filter** → Find artworks by tribe, price, search terms
3. **View Details** → Click artwork to see full details (`/artworks/[id]`)
4. **Add to Cart** → Add desired artworks
5. **Review Cart** → View cart (`/cart`), adjust quantities
6. **Checkout** → Enter delivery details (`/checkout`)
7. **Track Orders** → View order history in dashboard (`/dashboard?tab=orders`)

### **Artist Journey**
1. **Sign Up** → Register as artist (`/signup?role=artist`)
2. **Setup Profile** → Complete artist profile (`/setup-artist`)
3. **Upload Artwork** → Add artworks (`/dashboard/upload`)
4. **Manage Listings** → View/edit artworks (`/dashboard?tab=my-artworks`)
5. **Track Sales** → Monitor orders received (`/dashboard?tab=orders`)

---

## 📁 File Structure

```
artroot/
├── app/
│   ├── artworks/
│   │   ├── page.tsx              # Gallery with filters
│   │   └── [id]/
│   │       └── page.tsx          # Artwork detail page
│   ├── cart/
│   │   └── page.tsx              # Shopping cart
│   ├── checkout/
│   │   └── page.tsx              # Checkout & order placement
│   ├── dashboard/
│   │   ├── page.tsx              # Unified dashboard (buyer/artist)
│   │   └── upload/
│   │       └── page.tsx          # Artwork upload form
│   ├── setup-artist/
│   │   └── page.tsx              # Artist profile setup
│   ├── login/
│   │   └── page.tsx              # Login with role selection
│   └── signup/
│       └── page.tsx              # Signup with role selection
├── components/
│   ├── ArtworkCard.tsx           # Enhanced with cart button
│   ├── Navbar.tsx                # Cart icon, user menu
│   ├── Footer.tsx
│   └── ...
├── contexts/
│   └── CartContext.tsx           # Global cart state management
└── lib/
    ├── api.ts                    # API utilities
    └── auth.ts                   # Auth helpers

backend/
└── src/
    ├── routes/
    │   ├── artists.ts            # New artist profile routes
    │   ├── artworks.ts           # Artwork CRUD
    │   ├── orders.ts             # Order management
    │   ├── favorites.ts          # Favorites/wishlist
    │   └── auth.ts               # Authentication
    └── services/
        ├── artistService.ts      # Artist profile logic
        ├── artworkService.ts     # Artwork operations
        ├── orderService.ts       # Order processing
        └── ...
```

---

## 🎯 Key Technologies Used

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **State Management**: React Context API (CartContext)
- **Icons**: Lucide React
- **Authentication**: Custom JWT + Clerk (hybrid)
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (via existing schema)

---

## 🚀 Getting Started

### Prerequisites
1. Node.js 18+ installed
2. PostgreSQL database running
3. Environment variables configured

### Installation

1. **Install dependencies**:
   ```bash
   # Frontend
   cd artroot
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

2. **Start the backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Start the frontend**:
   ```bash
   cd artroot
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

## 🔐 Authentication & Roles

### Roles
- **viewer** (default): Can browse and buy artworks
- **artist**: Can upload, manage artworks, and view sales
- **admin**: Full access (existing)

### Login Flow
- Users select role during signup/login
- URL parameter support: `?role=artist` or `?role=customer`
- JWT tokens include role information
- Protected routes check user role

---

## 📊 Database Schema

The platform uses the existing PostgreSQL schema with these key tables:
- `users` - User accounts
- `artists` - Artist profiles
- `artworks` - Artwork listings
- `orders` - Purchase orders
- `favorites` - User wishlist
- `reviews` - Artwork reviews

---

## 🎨 Design Features

### Visual Elements
- **Color Scheme**: Amber primary, gray neutrals
- **Typography**: Modern, clean fonts (Geist Sans)
- **Icons**: Consistent lucide-react icons
- **Responsive**: Mobile-first design
- **Animations**: Smooth transitions, hover effects

### User Experience
- **Loading States**: Skeleton screens, spinners
- **Empty States**: Helpful messages with CTAs
- **Success States**: Confirmation messages with auto-redirects
- **Error Handling**: User-friendly error messages

---

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user with role
- `POST /api/auth/login` - Login user

### Artworks
- `GET /api/artworks` - List artworks (with filters)
- `GET /api/artworks/:id` - Get artwork details
- `POST /api/artworks` - Create artwork (artist only)
- `PUT /api/artworks/:id` - Update artwork
- `DELETE /api/artworks/:id` - Delete artwork

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my` - Get buyer's orders
- `GET /api/orders/artist` - Get artist's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Artists
- `GET /api/artists/profile` - Get current user's artist profile
- `POST /api/artists/profile` - Create artist profile
- `PUT /api/artists/profile` - Update artist profile
- `GET /api/artists/:id` - Get public artist profile

### Favorites
- `GET /api/favorites/my` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:artworkId` - Remove from favorites

---

## 📝 Next Steps & Future Enhancements

### Recommended Improvements
1. **Image Upload**: Integrate Cloudinary/AWS S3 for direct image uploads
2. **Payment Gateway**: Add Stripe/Razorpay for online payments
3. **Reviews**: Enable buyers to review purchased artworks
4. **Notifications**: Email/SMS order updates
5. **Analytics**: Artist sales dashboard with charts
6. **Search Optimization**: Advanced search with Elasticsearch
7. **Social Features**: Share artworks, follow artists
8. **Mobile App**: React Native version

---

## 🐛 Troubleshooting

### Common Issues

**Cart not updating?**
- Check browser console for errors
- Clear localStorage: `localStorage.clear()`
- Refresh the page

**Orders not creating?**
- Ensure user is logged in
- Check backend is running on port 5000
- Verify JWT token is valid

**Artist can't upload?**
- Ensure artist profile is created (`/setup-artist`)
- Check user role is 'artist'
- Verify authentication token

---

## 📞 Support

For issues or questions:
- Check browser console for errors
- Review backend logs
- Verify database connections
- Check API responses in Network tab

---

## 🎉 Summary

ArtRoot is now a **fully functional e-commerce platform** with:
- ✅ Complete buyer journey (browse → cart → checkout → orders)
- ✅ Complete artist journey (signup → profile → upload → manage)
- ✅ Modern, responsive UI
- ✅ Secure authentication with roles
- ✅ Real-time cart management
- ✅ Order tracking and management
- ✅ Professional design and UX

The platform is ready for **production use** with proper environment setup and deployment!
