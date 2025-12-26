const jwt = require('../user/jwt/jwt')
const db = require('../database/db')

module.exports = async (req, res, next) => {
	try {
		// Check if Authorization header exists
		let token = req.headers.authorization || req.headers.Authorization;
		
		if (!token) {
			return res.status(401).json({
				"status": "Unauthorized",
				"message": "No authorization token provided",
				"statusCode": 401
			})
		}

		// Extract token from Bearer format
		if (token.startsWith('Bearer ')) {
			token = token.split('Bearer ')[1]
		} else {
			return res.status(401).json({
				"status": "Unauthorized",
				"message": "Invalid authorization format. Use: Bearer <token>",
				"statusCode": 401
			})
		}

		// Verify the token
		let { userId } = await jwt.verifyToken(token)
		
		// Check if user exists in database (using username instead of email since email doesn't exist in schema)
		const user = await db.query(`SELECT userid, username FROM users WHERE userid = $1`, [userId])
		
		if (user.rowCount > 0) {
			// Attach user information to request
			req.userId = userId
			req.user = user.rows[0]
			return next()
		}
		
		return res.status(401).json({
			"status": "Unauthorized",
			"message": "User not found",
			"statusCode": 401
		})
		
	} catch (error) {
		console.log('Auth middleware error:', error)
		
		// Handle JWT specific errors
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({
				"status": "Unauthorized",
				"message": "Invalid token",
				"statusCode": 401
			})
		}
		
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({
				"status": "Unauthorized",
				"message": "Token expired",
				"statusCode": 401
			})
		}
		
		// Generic error
		return res.status(500).json({
			"status": "Internal Server Error",
			"message": "Authentication failed",
			"statusCode": 500
		})
	}
}
