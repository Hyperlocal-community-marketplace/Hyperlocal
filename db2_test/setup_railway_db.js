const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Railway connection details
const config = {
  host: 'interchange.proxy.rlwy.net',
  port: 58717,
  user: 'root',
  password: 'cNYkWhRFQFwhQEWNXYPMDZbyyDuLLNYE',
  database: 'railway',
  multipleStatements: true
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('Connecting to Railway MySQL database...');
    connection = await mysql.createConnection(config);
    console.log('✓ Connected successfully!');
    
    // Read the SQL setup file
    const sqlFile = path.join(__dirname, 'DATABASE_SETUP.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Remove DROP/CREATE DATABASE and USE commands
    sql = sql.replace(/DROP DATABASE.*?;/gi, '');
    sql = sql.replace(/CREATE DATABASE.*?;/gi, '');
    sql = sql.replace(/USE.*?;/gi, '');
    
    // Split into individual statements and filter out empty ones
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log('\nExecuting database setup script...');
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await connection.query(statement + ';');
          // Extract table name from CREATE TABLE statement
          const match = statement.match(/CREATE TABLE.*?`?(\w+)`?/i);
          if (match) {
            console.log(`✓ Created table: ${match[1]}`);
          }
        } catch (err) {
          console.error(`✗ Error executing statement ${i + 1}:`, err.message);
          if (statement.includes('CREATE TABLE')) {
            console.log('Statement preview:', statement.substring(0, 100) + '...');
          }
        }
      }
    }
    console.log('\n✓ Database schema created successfully!');
    
    // Verify tables were created
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n✓ Tables created:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    console.log('\n✅ Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Go to Render.com to deploy your backend');
    console.log('2. Use these environment variables in Render:');
    console.log('   DB_HOST=interchange.proxy.rlwy.net');
    console.log('   DB_USER=root');
    console.log('   DB_PASSWORD=cNYkWhRFQFwhQEWNXYPMDZbyyDuLLNYE');
    console.log('   DB_NAME=railway');
    console.log('   DB_PORT=58717');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
