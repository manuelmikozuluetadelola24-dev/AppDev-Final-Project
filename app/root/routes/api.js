const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/users/:user', async (rec, res) => {
	const { user } = req.params;
	const username = req.username;

	let record = await db.query(`
		SELECT
			users.username
			FROM
			users

