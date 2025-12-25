const express = require('express');
const apiRoute = require('./routes/api_new');
const authRoute = require('./routes/auth');
const middleware = require('./middleware/auth_middleware');
const migrateRoute = require('./routes/migrate');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// routing

app.use('/api', middleware, apiRoute);
app.use('/auth', authRoute);
app.use('/migrate', migrateRoute);

app.get('/', (res, req) => {
	res.status(200);
})

app.use((req, res, next) => {
	res.status(404).json({
		"statusCode": 404,
		"message": "endpoint not found"
	});
})

app.use((err, req, res, next) => {
	const statusCode = res.statusCode === 200 ? 500: res.statusCode;
	res.status(statusCode);
	res.json({
		message: err.message,
		message: err.stack,
	});
})

app.listen(port);
