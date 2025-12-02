require('dotenv').config({ path: './config/.env' });
const bcrypt = require('bcryptjs');
const pool = require('./db/db');

// Indian zipcode 411028 (Pune, Maharashtra)
const ZIPCODE = '411028';
const CITY = 'Pune';
const COUNTRY = 'India';
const LATITUDE = 18.5204;
const LONGITUDE = 73.8567;

// Common password for all test accounts: Test123!
const COMMON_PASSWORD = 'Test123!';

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function seedMockData() {
  try {
    console.log('🌱 Starting to seed mock data...\n');

    // 1. Insert Location
    console.log('📍 Inserting location data...');
    await pool.query(
      `INSERT INTO Locations (zipCode, city, country, latitude, longitude) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       city = VALUES(city),
       country = VALUES(country),
       latitude = VALUES(latitude),
       longitude = VALUES(longitude)`,
      [ZIPCODE, CITY, COUNTRY, LATITUDE, LONGITUDE]
    );
    console.log(`✅ Location ${ZIPCODE} (${CITY}) inserted\n`);

    // 2. Hash password once
    const hashedPassword = await hashPassword(COMMON_PASSWORD);
    console.log('🔐 Password hashed\n');

    // 3. Insert Users
    console.log('👥 Inserting users...');
    const users = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@test.com',
        phoneNumber: '9876543210',
        address: '123 MG Road, Kothrud'
      },
      {
        name: 'Priya Sharma',
        email: 'priya@test.com',
        phoneNumber: '9876543211',
        address: '456 FC Road, Deccan'
      },
      {
        name: 'Amit Patel',
        email: 'amit@test.com',
        phoneNumber: '9876543212',
        address: '789 JM Road, Shivajinagar'
      },
      {
        name: 'Sneha Desai',
        email: 'sneha@test.com',
        phoneNumber: '9876543213',
        address: '321 Koregaon Park'
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@test.com',
        phoneNumber: '9876543214',
        address: '654 Baner Road'
      }
    ];

    const userIds = [];
    for (const user of users) {
      const [result] = await pool.query(
        `INSERT INTO Users (name, email, password, phoneNumber, address, zipCode)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         phoneNumber = VALUES(phoneNumber),
         address = VALUES(address),
         zipCode = VALUES(zipCode)`,
        [user.name, user.email, hashedPassword, user.phoneNumber, user.address, ZIPCODE]
      );
      const [userRow] = await pool.query('SELECT id FROM Users WHERE email = ?', [user.email]);
      userIds.push(userRow[0].id);
      console.log(`  ✅ User: ${user.name} (${user.email})`);
    }
    console.log(`✅ ${users.length} users inserted\n`);

    // 4. Insert Shops (Sellers)
    console.log('🏪 Inserting shops...');
    const shops = [
      {
        name: 'Fresh Groceries Store',
        email: 'freshgroceries@test.com',
        phoneNumber: '9876543301',
        address: '101 Market Street, Kothrud',
        description: 'Fresh vegetables, fruits, and daily essentials. Best quality guaranteed!'
      },
      {
        name: 'Tech Gadgets Hub',
        email: 'techhub@test.com',
        phoneNumber: '9876543302',
        address: '202 IT Park, Hinjewadi',
        description: 'Latest smartphones, laptops, and electronics. Authorized dealer.'
      },
      {
        name: 'Fashion Boutique',
        email: 'fashionboutique@test.com',
        phoneNumber: '9876543303',
        address: '303 Fashion Street, Koregaon Park',
        description: 'Trendy clothes, accessories, and designer wear. Latest fashion trends!'
      },
      {
        name: 'Home Decor Plus',
        email: 'homedecor@test.com',
        phoneNumber: '9876543304',
        address: '404 Furniture Lane, Baner',
        description: 'Beautiful home decor items, furniture, and accessories. Transform your home!'
      },
      {
        name: 'Book Paradise',
        email: 'bookparadise@test.com',
        phoneNumber: '9876543305',
        address: '505 Library Road, FC Road',
        description: 'Books for all ages. Fiction, non-fiction, academic books, and more!'
      }
    ];

    const shopIds = [];
    for (const shop of shops) {
      const [result] = await pool.query(
        `INSERT INTO Shops (name, email, password, phoneNumber, address, zipCode, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         phoneNumber = VALUES(phoneNumber),
         address = VALUES(address),
         zipCode = VALUES(zipCode),
         description = VALUES(description)`,
        [shop.name, shop.email, hashedPassword, shop.phoneNumber, shop.address, ZIPCODE, shop.description]
      );
      const [shopRow] = await pool.query('SELECT id FROM Shops WHERE email = ?', [shop.email]);
      shopIds.push(shopRow[0].id);
      console.log(`  ✅ Shop: ${shop.name} (${shop.email})`);
    }
    console.log(`✅ ${shops.length} shops inserted\n`);

    // 5. Insert Products
    console.log('📦 Inserting products...');
    const products = [
      // Fresh Groceries Store products
      { name: 'Fresh Tomatoes (1kg)', description: 'Farm fresh red tomatoes', category: 'Vegetables', originalPrice: 40, discountPrice: 35, stock: 50, shopIndex: 0 },
      { name: 'Organic Potatoes (2kg)', description: 'Fresh organic potatoes', category: 'Vegetables', originalPrice: 60, discountPrice: 55, stock: 30, shopIndex: 0 },
      { name: 'Bananas (1 dozen)', description: 'Ripe yellow bananas', category: 'Fruits', originalPrice: 50, discountPrice: 45, stock: 40, shopIndex: 0 },
      { name: 'Milk (1L)', description: 'Fresh full cream milk', category: 'Dairy', originalPrice: 60, discountPrice: null, stock: 100, shopIndex: 0 },
      { name: 'Eggs (1 dozen)', description: 'Farm fresh eggs', category: 'Dairy', originalPrice: 80, discountPrice: 75, stock: 60, shopIndex: 0 },
      
      // Tech Gadgets Hub products
      { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with 2.4GHz connectivity', category: 'Electronics', originalPrice: 599, discountPrice: 499, stock: 25, shopIndex: 1 },
      { name: 'USB-C Cable', description: 'Fast charging USB-C cable (1m)', category: 'Electronics', originalPrice: 299, discountPrice: 249, stock: 50, shopIndex: 1 },
      { name: 'Bluetooth Headphones', description: 'Noise cancelling wireless headphones', category: 'Electronics', originalPrice: 1999, discountPrice: 1499, stock: 15, shopIndex: 1 },
      { name: 'Phone Stand', description: 'Adjustable aluminum phone stand', category: 'Accessories', originalPrice: 399, discountPrice: 299, stock: 30, shopIndex: 1 },
      { name: 'Laptop Bag', description: 'Waterproof laptop bag with padding', category: 'Accessories', originalPrice: 1299, discountPrice: 999, stock: 20, shopIndex: 1 },
      
      // Fashion Boutique products
      { name: 'Cotton T-Shirt', description: 'Comfortable cotton t-shirt in multiple colors', category: 'Clothing', originalPrice: 599, discountPrice: 449, stock: 40, shopIndex: 2 },
      { name: 'Denim Jeans', description: 'Classic fit denim jeans', category: 'Clothing', originalPrice: 1499, discountPrice: 1199, stock: 25, shopIndex: 2 },
      { name: 'Leather Wallet', description: 'Genuine leather wallet with card slots', category: 'Accessories', originalPrice: 899, discountPrice: 699, stock: 35, shopIndex: 2 },
      { name: 'Sunglasses', description: 'UV protection sunglasses', category: 'Accessories', originalPrice: 1299, discountPrice: 999, stock: 20, shopIndex: 2 },
      { name: 'Running Shoes', description: 'Comfortable sports running shoes', category: 'Footwear', originalPrice: 2499, discountPrice: 1999, stock: 15, shopIndex: 2 },
      
      // Home Decor Plus products
      { name: 'Wall Clock', description: 'Modern wall clock with wooden frame', category: 'Decor', originalPrice: 799, discountPrice: 599, stock: 20, shopIndex: 3 },
      { name: 'Table Lamp', description: 'LED table lamp with adjustable brightness', category: 'Lighting', originalPrice: 1299, discountPrice: 999, stock: 18, shopIndex: 3 },
      { name: 'Throw Pillow Set', description: 'Set of 2 decorative throw pillows', category: 'Decor', originalPrice: 899, discountPrice: 699, stock: 25, shopIndex: 3 },
      { name: 'Photo Frame', description: 'Wooden photo frame (8x10 inches)', category: 'Decor', originalPrice: 499, discountPrice: 399, stock: 30, shopIndex: 3 },
      { name: 'Plant Pot', description: 'Ceramic plant pot with drainage', category: 'Garden', originalPrice: 399, discountPrice: 299, stock: 40, shopIndex: 3 },
      
      // Book Paradise products
      { name: 'The Great Gatsby', description: 'Classic novel by F. Scott Fitzgerald', category: 'Fiction', originalPrice: 299, discountPrice: 249, stock: 15, shopIndex: 4 },
      { name: 'Python Programming Guide', description: 'Complete guide to Python programming', category: 'Education', originalPrice: 599, discountPrice: 499, stock: 20, shopIndex: 4 },
      { name: 'Cookbook: Indian Recipes', description: 'Traditional Indian recipes collection', category: 'Cookbook', originalPrice: 449, discountPrice: 399, stock: 12, shopIndex: 4 },
      { name: 'Children Story Book', description: 'Illustrated story book for kids', category: 'Children', originalPrice: 199, discountPrice: 149, stock: 30, shopIndex: 4 },
      { name: 'Self-Help: Success Guide', description: 'Motivational self-help book', category: 'Self-Help', originalPrice: 349, discountPrice: 299, stock: 18, shopIndex: 4 }
    ];

    const productIds = [];
    for (const product of products) {
      const [result] = await pool.query(
        `INSERT INTO Products (name, description, category, originalPrice, discountPrice, stock, shopId)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [product.name, product.description, product.category, product.originalPrice, product.discountPrice, product.stock, shopIds[product.shopIndex]]
      );
      productIds.push(result.insertId);
      console.log(`  ✅ Product: ${product.name} (Shop: ${shops[product.shopIndex].name})`);
    }
    console.log(`✅ ${products.length} products inserted\n`);

    // 6. Insert Orders
    console.log('🛒 Inserting orders...');
    const orders = [
      {
        userId: userIds[0],
        shopId: shopIds[0],
        cart: JSON.stringify([
          { productId: productIds[0], name: products[0].name, price: products[0].discountPrice || products[0].originalPrice, quantity: 2 },
          { productId: productIds[1], name: products[1].name, price: products[1].discountPrice || products[1].originalPrice, quantity: 1 }
        ]),
        totalPrice: (products[0].discountPrice || products[0].originalPrice) * 2 + (products[1].discountPrice || products[1].originalPrice),
        status: 'Delivered',
        user: JSON.stringify({ id: userIds[0], name: users[0].name, email: users[0].email })
      },
      {
        userId: userIds[1],
        shopId: shopIds[1],
        cart: JSON.stringify([
          { productId: productIds[5], name: products[5].name, price: products[5].discountPrice || products[5].originalPrice, quantity: 1 },
          { productId: productIds[6], name: products[6].name, price: products[6].discountPrice || products[6].originalPrice, quantity: 2 }
        ]),
        totalPrice: (products[5].discountPrice || products[5].originalPrice) + (products[6].discountPrice || products[6].originalPrice) * 2,
        status: 'Pending',
        user: JSON.stringify({ id: userIds[1], name: users[1].name, email: users[1].email })
      },
      {
        userId: userIds[2],
        shopId: shopIds[2],
        cart: JSON.stringify([
          { productId: productIds[10], name: products[10].name, price: products[10].discountPrice || products[10].originalPrice, quantity: 1 },
          { productId: productIds[11], name: products[11].name, price: products[11].discountPrice || products[11].originalPrice, quantity: 1 }
        ]),
        totalPrice: (products[10].discountPrice || products[10].originalPrice) + (products[11].discountPrice || products[11].originalPrice),
        status: 'Processing',
        user: JSON.stringify({ id: userIds[2], name: users[2].name, email: users[2].email })
      },
      {
        userId: userIds[0],
        shopId: shopIds[3],
        cart: JSON.stringify([
          { productId: productIds[15], name: products[15].name, price: products[15].discountPrice || products[15].originalPrice, quantity: 1 }
        ]),
        totalPrice: products[15].discountPrice || products[15].originalPrice,
        status: 'Delivered',
        user: JSON.stringify({ id: userIds[0], name: users[0].name, email: users[0].email })
      },
      {
        userId: userIds[3],
        shopId: shopIds[4],
        cart: JSON.stringify([
          { productId: productIds[20], name: products[20].name, price: products[20].discountPrice || products[20].originalPrice, quantity: 1 },
          { productId: productIds[21], name: products[21].name, price: products[21].discountPrice || products[21].originalPrice, quantity: 1 }
        ]),
        totalPrice: (products[20].discountPrice || products[20].originalPrice) + (products[21].discountPrice || products[21].originalPrice),
        status: 'Pending',
        user: JSON.stringify({ id: userIds[3], name: users[3].name, email: users[3].email })
      }
    ];

    for (const order of orders) {
      const shippingAddress = JSON.stringify({
        fullName: users.find(u => u.email === JSON.parse(order.user).email)?.name || 'User',
        email: JSON.parse(order.user).email,
        phone: users.find(u => u.email === JSON.parse(order.user).email)?.phoneNumber || '9876543210',
        address: users.find(u => u.email === JSON.parse(order.user).email)?.address || '123 Street',
        zipCode: ZIPCODE
      });

      await pool.query(
        `INSERT INTO ORDERS (cart, shippingAddress, user, totalPrice, shopId, status, deliveredAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          order.cart,
          shippingAddress,
          order.user,
          order.totalPrice,
          order.shopId,
          order.status,
          order.status === 'Delivered' ? new Date() : null
        ]
      );
      console.log(`  ✅ Order: ${order.status} - ₹${order.totalPrice} (User: ${JSON.parse(order.user).name})`);
    }
    console.log(`✅ ${orders.length} orders inserted\n`);

    // 7. Insert Conversations
    console.log('💬 Inserting conversations...');
    const conversations = [
      {
        userId: userIds[0],
        sellerId: shopIds[0],
        groupTitle: `${users[0].name}-${shops[0].name}-Order1`
      },
      {
        userId: userIds[1],
        sellerId: shopIds[1],
        groupTitle: `${users[1].name}-${shops[1].name}-Order2`
      },
      {
        userId: userIds[2],
        sellerId: shopIds[2],
        groupTitle: `${users[2].name}-${shops[2].name}-Order3`
      }
    ];

    const conversationIds = [];
    for (const conv of conversations) {
      const [result] = await pool.query(
        `INSERT INTO CONVERSATION (groupTitle, userId, sellerId, lastMessage)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         lastMessage = VALUES(lastMessage)`,
        [conv.groupTitle, conv.userId, conv.sellerId, 'Hello, I have a question about my order.']
      );
      const [convRow] = await pool.query('SELECT id FROM CONVERSATION WHERE groupTitle = ?', [conv.groupTitle]);
      conversationIds.push(convRow[0].id);
      console.log(`  ✅ Conversation: ${conv.groupTitle}`);
    }
    console.log(`✅ ${conversations.length} conversations inserted\n`);

    // 8. Insert Messages
    console.log('📨 Inserting messages...');
    const messages = [
      { conversationId: conversationIds[0], sender: userIds[0], senderRole: 'user', text: 'Hello, when will my order be delivered?' },
      { conversationId: conversationIds[0], sender: shopIds[0], senderRole: 'seller', text: 'Hi! Your order will be delivered by tomorrow evening.' },
      { conversationId: conversationIds[0], sender: userIds[0], senderRole: 'user', text: 'Great, thank you!' },
      { conversationId: conversationIds[1], sender: userIds[1], senderRole: 'user', text: 'Is the product in stock?' },
      { conversationId: conversationIds[1], sender: shopIds[1], senderRole: 'seller', text: 'Yes, it is available. You can place your order.' },
      { conversationId: conversationIds[2], sender: userIds[2], senderRole: 'user', text: 'Can I get a discount on bulk purchase?' },
      { conversationId: conversationIds[2], sender: shopIds[2], senderRole: 'seller', text: 'Sure! We offer 10% discount on orders above ₹5000.' }
    ];

    for (const msg of messages) {
      await pool.query(
        `INSERT INTO MESSAGES (conversationId, sender, senderRole, text)
         VALUES (?, ?, ?, ?)`,
        [msg.conversationId, msg.sender, msg.senderRole, msg.text]
      );
    }
    console.log(`✅ ${messages.length} messages inserted\n`);

    console.log('✨ Mock data seeding completed successfully!\n');
    console.log('📋 ACCOUNT CREDENTIALS:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔑 Common Password for ALL accounts: Test123!');
    console.log('\n👥 USER ACCOUNTS:');
    users.forEach((user, idx) => {
      console.log(`   ${idx + 1}. ${user.name}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Password: ${COMMON_PASSWORD}`);
    });
    console.log('\n🏪 SELLER ACCOUNTS:');
    shops.forEach((shop, idx) => {
      console.log(`   ${idx + 1}. ${shop.name}`);
      console.log(`      Email: ${shop.email}`);
      console.log(`      Password: ${COMMON_PASSWORD}`);
    });
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`📍 All accounts use zipcode: ${ZIPCODE} (${CITY}, ${COUNTRY})`);
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding mock data:', error);
    throw error;
  }
}

// Run the seeding
seedMockData()
  .then(() => {
    console.log('✅ Seeding process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding process failed:', error);
    process.exit(1);
  });

