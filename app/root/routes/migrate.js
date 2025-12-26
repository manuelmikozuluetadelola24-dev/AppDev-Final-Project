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
			id SERIAL PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
		    description TEXT,
		    priority VARCHAR(32) NOT NULL,
		    user_id INTEGER NOT NULL REFERENCES users(userId),
		    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
		    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
			);
		`)
	res.status(201).json({
		"message": "success"
	})
})
module.exports = router;
