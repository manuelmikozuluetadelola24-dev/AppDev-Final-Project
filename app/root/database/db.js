const { Pool } = require('pg')

class Database {
	constructor() {
		this.pool = new Pool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		port: process.env.DB_PORT
		});
	}

	async query(text, params) {
	this.client = await this.pool.connect();
	const res = await this.client.query(text, params);
	await this.close();
	return res;
	}
  
	async close() {
	await this.client.end();
	console.log('Closed database connection');
	}
}
  
module.exports = new Database();
