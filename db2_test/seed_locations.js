const mysql = require('mysql2/promise');

const config = {
  host: 'interchange.proxy.rlwy.net',
  port: 58717,
  user: 'root',
  password: 'cNYkWhRFQFwhQEWNXYPMDZbyyDuLLNYE',
  database: 'railway'
};

async function seedLocations() {
  let connection;
  
  try {
    console.log('Connecting to Railway database...');
    connection = await mysql.createConnection(config);
    console.log('✓ Connected!\n');
    
    const locations = [
      { zipCode: '10001', city: 'New York', country: 'USA', lat: 40.7506, lng: -73.9971 },
      { zipCode: '90001', city: 'Los Angeles', country: 'USA', lat: 33.9731, lng: -118.2479 },
      { zipCode: '60601', city: 'Chicago', country: 'USA', lat: 41.8858, lng: -87.6230 },
      { zipCode: '411001', city: 'Pune', country: 'India', lat: 18.5204, lng: 73.8567 },
      { zipCode: '400001', city: 'Mumbai', country: 'India', lat: 18.9388, lng: 72.8354 },
      { zipCode: '110001', city: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
      { zipCode: '94102', city: 'San Francisco', country: 'USA', lat: 37.7799, lng: -122.4190 },
    ];
    
    console.log('Adding ZIP codes to Locations table...\n');
    
    for (const loc of locations) {
      try {
        await connection.query(
          'INSERT IGNORE INTO Locations (zipCode, city, country, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
          [loc.zipCode, loc.city, loc.country, loc.lat, loc.lng]
        );
        console.log(`✓ Added: ${loc.zipCode} - ${loc.city}, ${loc.country}`);
      } catch (err) {
        console.log(`✗ Error adding ${loc.zipCode}:`, err.message);
      }
    }
    
    console.log('\n✅ Locations seeded successfully!');
    console.log('\nYou can now register with these ZIP codes:');
    locations.forEach(loc => console.log(`  - ${loc.zipCode} (${loc.city})`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

seedLocations();
