const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/tasks - Get all tasks for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  
  try {
    // Query external database for user's tasks
    const result = await pool.query(
      'SELECT id, title, description, expiration_date, priority, user_id, created_at, updated_at FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json({ tasks: result.rows });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      message: 'Server error fetching tasks',
      error: error.message 
    });
  }
});

// POST /api/tasks - Add new task
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  
  try {
    const { title, description, expiration_date, priority } = req.body;

    if (!title || !priority) {
      return res.status(400).json({ message: 'Title and priority are required' });
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ message: 'Priority must be low, medium, or high' });
    }

    // Insert task into external database (tasks table)
    const result = await pool.query(
      'INSERT INTO tasks (title, description, expiration_date, priority, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [title, description || null, expiration_date || null, priority, req.user.userId]
    );

    res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0]
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      message: 'Server error creating task',
      error: error.message 
    });
  }
});

// PUT /api/tasks/:id - Edit/Update task
router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  
  try {
    const taskId = req.params.id;
    const { title, description, expiration_date, priority } = req.body;

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ message: 'Priority must be low, medium, or high' });
    }

    // Check if task exists and belongs to user in external database
    const taskCheck = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, req.user.userId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    // Update task in external database
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, expiration_date = $3, priority = $4, updated_at = NOW() WHERE id = $5 AND user_id = $6 RETURNING *',
      [
        title || taskCheck.rows[0].title,
        description !== undefined ? description : taskCheck.rows[0].description,
        expiration_date !== undefined ? expiration_date : taskCheck.rows[0].expiration_date,
        priority || taskCheck.rows[0].priority,
        taskId,
        req.user.userId
      ]
    );

    res.json({
      message: 'Task updated successfully',
      task: result.rows[0]
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      message: 'Server error updating task',
      error: error.message 
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  
  try {
    const taskId = req.params.id;

    // Delete task from external database
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [taskId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.json({
      message: 'Task deleted successfully',
      task: result.rows[0]
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      message: 'Server error deleting task',
      error: error.message 
    });
  }
});

module.exports = router;
