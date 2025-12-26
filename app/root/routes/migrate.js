const express = require('express');
const db = require('../database/db');
const router = express.Router();

router.all("/", async (req, res) => {
	await db.query(`
		DROP TABLE IF EXISTS users;
		CREATE TABLE users (
		userId SERIAL PRIMARY KEY,
		username VARCHAR(255) NOT NULL UNIQUE,
		password VARCHAR(255) NOT NULL
		);
	`)

	await db.query(`
		DROP TABLE IF EXISTS tasks;
		CREATE TABLE tasks (
			id VARCHAR(255) NOT NULL,
			title VARCHAR(255) NOT NULL,
                	description VARCHAR(512),
                	priority VARCHAR(32) NOT NULL,
                	user_id VARCHAR(255) NOT NULL,
                	created_at VARCHAR(255) NOT NULL,
                	updated_at VARCHAR(255) NOT NULL
			);
		`)
	res.status(201).json({
		"message": "success"
	})
})
module.exports = router;
