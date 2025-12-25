// Global state
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user'));

// DOM elements
const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');
const authMessage = document.getElementById('authMessage');
const appMessage = document.getElementById('appMessage');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const taskForm = document.getElementById('taskForm');
const logoutBtn = document.getElementById('logoutBtn');
const currentUsername = document.getElementById('currentUsername');
const tasksList = document.getElementById('tasksList');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (token && currentUser) {
        showApp();
        loadTasks();
    } else {
        showAuth();
    }
});

// Show/Hide sections
function showAuth() {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
}

function showApp() {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    currentUsername.textContent = currentUser.username;
}

// Show messages
function showMessage(element, message, type) {
    element.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => {
        element.innerHTML = '';
    }, 5000);
}

// Registration - POST to /api/auth/register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(authMessage, 'Registration successful! Please login.', 'success');
            registerForm.reset();
        } else {
            showMessage(authMessage, data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage(authMessage, 'Network error. Please try again.', 'error');
    }
});

// Login - POST to /api/auth/login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            loginForm.reset();
            showApp();
            loadTasks();
        } else {
            showMessage(authMessage, data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage(authMessage, 'Network error. Please try again.', 'error');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuth();
    tasksList.innerHTML = '<div class="no-tasks">No tasks yet. Add your first task!</div>';
});

// Add Task - POST to /api/tasks
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const expiration_date = document.getElementById('taskDate').value;
    const priority = document.getElementById('taskPriority').value;

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                expiration_date: expiration_date || null,
                priority
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(appMessage, 'Task added successfully!', 'success');
            taskForm.reset();
            loadTasks();
        } else {
            showMessage(appMessage, data.message || 'Failed to add task', 'error');
        }
    } catch (error) {
        showMessage(appMessage, 'Network error. Please try again.', 'error');
    }
});

// Load Tasks - GET from /api/tasks
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            displayTasks(data.tasks);
        } else {
            showMessage(appMessage, data.message || 'Failed to load tasks', 'error');
        }
    } catch (error) {
        showMessage(appMessage, 'Network error. Please try again.', 'error');
    }
}

// Display Tasks
function displayTasks(tasks) {
    if (tasks.length === 0) {
        tasksList.innerHTML = '<div class="no-tasks">No tasks yet. Add your first task!</div>';
        return;
    }

    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item priority-${task.priority}">
            <div class="task-header">
                <div>
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
            </div>
            ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            ${task.expiration_date ? `<div class="task-date">📅 Due: ${formatDate(task.expiration_date)}</div>` : ''}
            <div class="task-actions">
                <button onclick="editTask(${task.id})">Edit</button>
                <button class="btn-danger" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Delete Task - DELETE to /api/tasks/:id
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(appMessage, 'Task deleted successfully!', 'success');
            loadTasks();
        } else {
            showMessage(appMessage, data.message || 'Failed to delete task', 'error');
        }
    } catch (error) {
        showMessage(appMessage, 'Network error. Please try again.', 'error');
    }
}

// Edit Task - PUT to /api/tasks/:id
async function editTask(taskId) {
    const title = prompt('Enter new title:');
    if (!title) return;

    const description = prompt('Enter new description:');
    const expiration_date = prompt('Enter new expiration date (YYYY-MM-DD):');
    const priority = prompt('Enter priority (low, medium, high):');

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
        alert('Invalid priority. Must be low, medium, or high.');
        return;
    }

    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                expiration_date,
                priority
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(appMessage, 'Task updated successfully!', 'success');
            loadTasks();
        } else {
            showMessage(appMessage, data.message || 'Failed to update task', 'error');
        }
    } catch (error) {
        showMessage(appMessage, 'Network error. Please try again.', 'error');
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
