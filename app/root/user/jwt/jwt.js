const jwt = require('jsonwebtoken');

class JwtService {
	constructor() {
		this.secret = "my_super_secret_key_123";
		this.expiresIn = "1d";
  	}

	generateToken(payload) {
    		return new Promise((resolve, reject) => {
      			jwt.sign(payload, this.secret, { expiresIn: this.expiresIn }, (err, token) => {
        			if (err) {
					reject(err);
        			} else {
          				resolve(token);
        			}
      			});
    		});
  	}

	verifyToken(token) {
		return new Promise((resolve, reject) => {
			jwt.verify(token, this.secret, (err, decoded) => {
        			if (err) {
          				reject(err);
        			} else {
          				resolve(decoded);
        			}
      			});
    		});
  	}
}

module.exports = new JwtService;
