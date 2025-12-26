const jwt = require('../user/jwt/jwt')
const db = require('../database/db')

module.exports = async (req, res, next) => {
	let authHeader = req.headers.authorization || req.headers.Authorization;
	if (!authHeader) {
		return res.status(401).json({
			status: "Unauthorized",
			message: "Missing Authorization header",
			statusCode: 401
		})
	}
	const parts = authHeader.split(" ");
	if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
		return res.status(401).json({
			status: "Unauthorized",
			message: "Invalid Authorization header format",
			statusCode: 401
		})
	}
	const token = parts[1];
	try {
		let { userId } = await jwt.verifyToken(token)
		const user = await db.query(`SELECT email from users where userid =$1`, [userId])
		if (user.rowCount > 0) {
			req.userId = userId
			return next()
		}
		return res.status(400).json({
			"status": "Bad Request",
			"message": "Client error",
			"statusCode": 400
		})
	} catch (error) {
		console.log(error)
		return res.status(401).json({
			status: "Unauthorized",
			message: "Invalid or expired token",
			statusCode: 401
		})
	}

}
