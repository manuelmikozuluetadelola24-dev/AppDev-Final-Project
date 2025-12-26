const express = require('express');
const router = express.Router();
const db = require('../database/db');
const jwt = require('../user/jwt/jwt');

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                status: 'unauthorized',
                message: 'Access token required',
                statusCode: 401
            });
        }

        // Verify JWT token
        const decoded = await jwt.verifyToken(token);
        req.userId = decoded.userId; // Attach userId to request
        next();
    } catch (error) {
        return res.status(403).json({
            status: 'forbidden',
            message: 'Invalid or expired token',
            statusCode: 403
        });
    }
};

// GET /api/tasks - Retrieve all tasks for authenticated user
router.get('/tasks', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;

        // Query tasks table matching userId from JWT
        const result = await db.query(`
            SELECT 
                id,
                title,
                description,
                priority,
                user_id as userId,
                created_at,
                updated_at
            FROM tasks 
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [userId]);

        return res.status(200).json({
            status: 'success',
            message: 'Tasks retrieved successfully',
            data: {
                tasks: result.rows,
                count: result.rowCount
            }
        });

    } catch (error) {
        console.error('Error retrieving tasks:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve tasks',
            statusCode: 500
        });
    }
});

// GET /api/tasks/:id - Retrieve specific task by ID
router.get('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.id;

        // Query specific task matching both taskId and userId
        const result = await db.query(`
            SELECT 
                id,
                title,
                description,
                priority,
                user_id as userId,
                created_at,
                updated_at
            FROM tasks 
            WHERE id = $1 AND user_id = $2
        `, [taskId, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                status: 'not found',
                message: 'Task not found or unauthorized',
                statusCode: 404
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Task retrieved successfully',
            data: {
                task: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Error retrieving task:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve task',
            statusCode: 500
        });
    }
});

// POST /api/tasks - Create new task
router.post('/tasks', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { title, description, priority } = req.body;

        // Validate required fields
        if (!title || !priority) {
            return res.status(400).json({
                status: 'bad request',
                message: 'Title and priority are required',
                statusCode: 400
            });
        }

        // Validate priority value
        if (!['low', 'medium', 'high'].includes(priority)) {
            return res.status(400).json({
                status: 'bad request',
                message: 'Priority must be low, medium, or high',
                statusCode: 400
            });
        }

        // Insert task into database
        const result = await db.query(`
            INSERT INTO tasks (id, title, description, priority, user_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            RETURNING id, title, description, priority, user_id as userId, created_at, updated_at
        `, [userId, title, description || null, priority, userId]);

        return res.status(201).json({
            status: 'success',
            message: 'Task created successfully',
            data: {
                task: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Error creating task:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create task',
            statusCode: 500
        });
    }
});

// PUT /api/tasks/:id - Update existing task
router.put('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.id;
        const { title, description, priority } = req.body;

        // Validate priority if provided
        if (priority && !['low', 'medium', 'high'].includes(priority)) {
            return res.status(400).json({
                status: 'bad request',
                message: 'Priority must be low, medium, or high',
                statusCode: 400
            });
        }

        // Check if task exists and belongs to user
        const taskCheck = await db.query(`
            SELECT * FROM tasks WHERE id = $1 AND user_id = $2
        `, [taskId, userId]);

        if (taskCheck.rowCount === 0) {
            return res.status(404).json({
                status: 'not found',
                message: 'Task not found or unauthorized',
                statusCode: 404
            });
        }

        // Update task
        const result = await db.query(`
            UPDATE tasks 
            SET 
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                priority = COALESCE($3, priority),
                updated_at = NOW()
            WHERE id = $4 AND user_id = $5
            RETURNING id, title, description, priority, user_id as userId, created_at, updated_at
        `, [title, description, priority, taskId, userId]);

        return res.status(200).json({
            status: 'success',
            message: 'Task updated successfully',
            data: {
                task: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Error updating task:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update task',
            statusCode: 500
        });
    }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.id;

        // Delete task matching both taskId and userId
        const result = await db.query(`
            DELETE FROM tasks 
            WHERE id = $1 AND user_id = $2
            RETURNING id, title, description, priority, user_id as userId
        `, [taskId, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                status: 'not found',
                message: 'Task not found or unauthorized',
                statusCode: 404
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Task deleted successfully',
            data: {
                task: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Error deleting task:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete task',
            statusCode: 500
        });
    }
});

module.exports = router;
