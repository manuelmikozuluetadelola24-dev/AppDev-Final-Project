const { Pool } = require('pg');

class Database {
	constructor() {
		this.pool = new Pool({
			connectionString: process.env.DB_URL,
			ssl: { rejectUnauthorized: false }
		});
	}

  async query(text, params) {
    const client = await this.pool.connect();
    try {
      const res = await client.query(text, params);
      return res;
    } finally {
      client.release(); 
    }
  }
}

module.exports = new Database();
