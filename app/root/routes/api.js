const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/users/:id', async (rec, res) => {
	const { user } = req.params;
	const userId = req.userId;

	let record = await db.query(`
		SELECT
			users.userid::VARCHAR,
			users.username
			FROM
			users

