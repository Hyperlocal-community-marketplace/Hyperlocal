# Mock Data Credentials

## 🔑 Common Password for ALL Accounts
**Password: `Test123!`**

## 📍 Location
All accounts use zipcode: **411028** (Pune, Maharashtra, India)

---

## 👥 User Accounts

| # | Name | Email | Password |
|---|------|-------|----------|
| 1 | Rajesh Kumar | rajesh@test.com | Test123! |
| 2 | Priya Sharma | priya@test.com | Test123! |
| 3 | Amit Patel | amit@test.com | Test123! |
| 4 | Sneha Desai | sneha@test.com | Test123! |
| 5 | Vikram Singh | vikram@test.com | Test123! |

---

## 🏪 Seller/Shop Accounts

| # | Shop Name | Email | Password |
|---|-----------|-------|----------|
| 1 | Fresh Groceries Store | freshgroceries@test.com | Test123! |
| 2 | Tech Gadgets Hub | techhub@test.com | Test123! |
| 3 | Fashion Boutique | fashionboutique@test.com | Test123! |
| 4 | Home Decor Plus | homedecor@test.com | Test123! |
| 5 | Book Paradise | bookparadise@test.com | Test123! |

---

## 📦 What's Included

### Data Summary:
- ✅ **1 Location** (411028 - Pune, India)
- ✅ **5 Users** with Indian names and addresses
- ✅ **5 Shops** with various categories
- ✅ **25 Products** across different categories:
  - Fresh Groceries Store: Vegetables, Fruits, Dairy (5 products)
  - Tech Gadgets Hub: Electronics, Accessories (5 products)
  - Fashion Boutique: Clothing, Accessories, Footwear (5 products)
  - Home Decor Plus: Decor, Lighting, Garden items (5 products)
  - Book Paradise: Books across different genres (5 products)
- ✅ **5 Orders** with different statuses (Pending, Processing, Delivered)
- ✅ **3 Conversations** between users and sellers
- ✅ **7 Messages** in conversations

### Product Categories:
- Vegetables & Fruits
- Dairy Products
- Electronics
- Accessories
- Clothing
- Footwear
- Home Decor
- Lighting
- Books (Fiction, Education, Cookbook, Children, Self-Help)

---

## 🚀 Quick Start

1. **Login as User:**
   - Email: `rajesh@test.com`
   - Password: `Test123!`

2. **Login as Seller:**
   - Email: `freshgroceries@test.com`
   - Password: `Test123!`

3. **View Products:** Browse products from different shops
4. **View Orders:** Check order history with different statuses
5. **Test Messaging:** Use conversations to test chat functionality

---

## 📝 Notes

- All accounts are located in Pune, India (zipcode: 411028)
- Products have realistic Indian pricing (₹)
- Orders include various statuses for testing
- Conversations and messages are pre-populated for testing chat features
- All passwords are hashed using bcrypt

---

## 🔄 Re-seeding Data

To re-run the seeding script:
```bash
cd db2_test
node seed_mock_data.js
```

The script uses `ON DUPLICATE KEY UPDATE` so it's safe to run multiple times.

