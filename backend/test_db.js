import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    console.log("Connecting to Railway DB...");
    const connection = await mysql.createConnection({
      host: 'crossover.proxy.rlwy.net',
      port: 31132,
      user: 'root',
      password: 'uhqROtcmVCSFdrWXyjTSnqlwqrLYyOMm',
      database: 'railway'
    });
    console.log("Success! Connected to DB.");
    await connection.end();
  } catch (error) {
    console.error("Failed to connect:", error.message);
  }
}

testConnection();
