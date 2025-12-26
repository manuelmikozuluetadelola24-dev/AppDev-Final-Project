const express = require('express');
const router = express.Router();
const db = require('../database/db');
const jwt = require('../user/jwt/jwt');
const crypto = require('crypto');

router.post('/user/register', async (req, res) => {
	const { username, password } = req.body;
	
	let hashedPassword = crypto.createHash('md5').update(password).digest('hex')

	const result = await db.query(
		'SELECT username FROM users WHERE username = $1',
		[username]
	);

	if(username == result)
	{
		return res.status(400).json({
			"message": "username already exists"
		});
	}

	return await db.query(`
		INSERT INTO users ( username, password )
		VALUES( $1, $2) RETURNING userid`,
		[ username, hashedPassword ])
	.then(async () => {
		const userid = await (await db.query(`SELECT userId as userid from users where username=$1`, [username])).rows[0].userid;

		const token = await jwt.generateToken({
			userId: userid
		})

		return res.status(201).json({
			"status": "success",
			"message": "registration complete",
			"data": {
				"accessToken": token,
				"user": {
					"userId": "" + userid.userid,
					"username": username
				}
			}
		})
	})
	.catch(error => {
		console.log(error);
		return res.status(400).json({
			"status": "Bad Request",
			"message": "Registration unsuccessful",
			"statusCode": 400
		});
	})
})

router.post('/user/login', async (req, res) => {
	const { username, password } = req.body;
	if(!username || !password || password.length == 0) {
		return res.status(401).json({
			"status": "bad request",
			"message": "authentication failed",
			"statusCode": 401
		})
	}

	let hashedPassword = crypto.createHash('md5').update(password).digest('hex')

	const user = await db.query(`SELECT * FROM users where username = $1 and password = $2`, [
		username,
		hashedPasswordpassword
	])
	if( user.rowCount > 0) {
		let { userid, username, password } = user.rows[0];
		return res.status(200).json({
			"status": "success",
			"message": "login successful",
			"data": {
				"accessToken": await jwt.generateToken({
					userId: userid
				}),
				"user": {
					"userId": "" + userid,
					"username": username
				}
			}
		})
	} else {
		return  res.status(401).json({
			"status": "bad request",
			"message": "authentication failed",
			"statusCode": 401
		})
	}
})

module.exports = router;

