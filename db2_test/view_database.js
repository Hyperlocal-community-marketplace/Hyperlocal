const mysql = require('mysql2/promise');

const config = {
  host: 'interchange.proxy.rlwy.net',
  port: 58717,
  user: 'root',
  password: 'cNYkWhRFQFwhQEWNXYPMDZbyyDuLLNYE',
  database: 'railway'
};

async function viewDatabase() {
  let connection;
  
  try {
    console.log('Connecting to Railway database...\n');
    connection = await mysql.createConnection(config);
    
    // Show all tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📊 Tables in database:');
    tables.forEach(t => console.log(`  - ${Object.values(t)[0]}`));
    
    // Count rows in each table
    console.log('\n📈 Row counts:');
    for (const tableObj of tables) {
      const tableName = Object.values(tableObj)[0];
      const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`  ${tableName}: ${count[0].count} rows`);
    }
    
    // Show recent users
    console.log('\n👥 Recent Users:');
    const [users] = await connection.query('SELECT id, name, email, zipCode, createdAt FROM Users ORDER BY createdAt DESC LIMIT 5');
    console.table(users);
    
    // Show shops
    console.log('\n🏪 Shops:');
    const [shops] = await connection.query('SELECT id, name, email, zipCode, createdAt FROM Shops ORDER BY createdAt DESC LIMIT 5');
    console.table(shops);
    
    // Show products
    console.log('\n📦 Products:');
    const [products] = await connection.query('SELECT id, name, shopId, price, stock, createdAt FROM Products ORDER BY createdAt DESC LIMIT 5');
    console.table(products);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

viewDatabase();
