# Todo List App - Frontend Documentation

A modern, responsive frontend for the todo list application with user authentication and task management.

## Features

### Authentication Pages (index.html)
- **Login & Registration**: Side-by-side forms for easy access
- **Auto-redirect**: Logged-in users go directly to tasks page
- **Token storage**: JWT stored in localStorage
- **Validation**: Password confirmation and length requirements
- **Responsive**: Works on all devices

### Task Management (tasks.html)
- **View tasks**: All user tasks with priority indicators
- **Create tasks**: Form with title, description, and priority
- **Edit tasks**: Modal dialog for updating tasks
- **Delete tasks**: Confirmation before deletion
- **Priority system**: Visual color coding (high=red, medium=yellow, low=green)
- **Task counter**: Real-time count display
- **Auto-logout**: Invalid token redirects to login

## Installation

### 1. File Structure

Place the frontend files in your server's public directory:

```
your-project/
├── public/
│   ├── index.html   ← Login/Register page
│   └── tasks.html   ← Task management page
├── routes/
│   ├── auth.js      ← Authentication routes
│   └── api.js       ← Task API routes
├── database/
│   └── db.js
├── user/
│   └── jwt/
│       └── jwt.js
└── server.js
```

### 2. Server Configuration

Ensure your Express server serves static files:

```javascript
// server.js
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public')); // Serve static files

app.use('/user', require('./routes/auth'));
app.use('/api', require('./routes/api'));

app.listen(3000, () => console.log('Server running on port 3000'));
```

### 3. Start Application

```bash
node server.js
```

### 4. Access URLs

- Login/Register: `http://localhost:3000/index.html`
- Tasks: `http://localhost:3000/tasks.html`

## API Endpoints

### Authentication Endpoints

**Register**
```
POST /user/register
Body: { username, password }
Response: {
  status: "success",
  message: "registration complete",
  data: {
    accessToken: "jwt_token",
    user: { userId, username }
  }
}
```

**Login**
```
POST /user/login
Body: { username, password }
Response: {
  status: "success",
  message: "login successful",
  data: {
    accessToken: "jwt_token",
    user: { userId, username }
  }
}
```

### Task Endpoints

All task endpoints require: `Authorization: Bearer {token}`

**Get All Tasks**
```
GET /api/tasks
Response: {
  status: "success",
  data: { tasks: [...], count: N }
}
```

**Create Task**
```
POST /api/tasks
Body: { title, description, priority }
Response: {
  status: "success",
  data: { task: {...} }
}
```

**Update Task**
```
PUT /api/tasks/:id
Body: { title, description, priority }
Response: {
  status: "success",
  data: { task: {...} }
}
```

**Delete Task**
```
DELETE /api/tasks/:id
Response: {
  status: "success",
  data: { task: {...} }
}
```

## User Guide

### Registration
1. Open the app in your browser
2. On the right side, fill in:
   - Username
   - Password (minimum 6 characters)
   - Confirm Password
3. Click "Register"
4. Automatically redirected to tasks page

### Login
1. On the left side, enter:
   - Username
   - Password
2. Click "Login"
3. Redirected to tasks page

### Creating Tasks
1. On tasks page, left panel has the form
2. Enter:
   - Title (required)
   - Description (optional)
   - Priority (low/medium/high)
3. Click "Add Task"
4. Task appears in the list

### Managing Tasks
- **Edit**: Click "Edit" button, modify in modal, save changes
- **Delete**: Click "Delete" button, confirm deletion
- **View**: All tasks shown with color-coded priority borders

### Logout
- Click "Logout" in header
- Redirected to login page
- Token cleared from storage

## Design Features

### Color Scheme
- Primary gradient: Purple (#667eea) to Violet (#764ba2)
- High priority: Red (#dc3545)
- Medium priority: Yellow (#ffc107)
- Low priority: Green (#28a745)

### Responsive Breakpoints
- Desktop: > 968px (side-by-side layout)
- Mobile: < 968px (stacked layout)

### Visual Feedback
- Button hover effects
- Form focus states
- Success/error messages
- Loading states
- Priority color indicators

## Data Storage

### LocalStorage Keys
- `accessToken`: JWT authentication token
- `userId`: User's ID
- `username`: User's display name

### Clear Storage
To reset authentication:
```javascript
localStorage.clear();
```

## Customization

### Change Colors
In the `<style>` section of each HTML file:

```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Priority colors */
.priority-high { border-left: 5px solid #dc3545; }
.priority-medium { border-left: 5px solid #ffc107; }
.priority-low { border-left: 5px solid #28a745; }
```

### Change Fonts
```css
body {
  font-family: 'Your Font', 'Segoe UI', sans-serif;
}
```

### Adjust Spacing
```css
.container {
  padding: 20px;  /* Outer padding */
}

.form-group {
  margin-bottom: 20px;  /* Form field spacing */
}
```

## Troubleshooting

### Common Issues

**Can't login/register**
- Check server is running
- Verify API endpoints match backend routes
- Check browser console for errors
- Ensure CORS is configured if frontend/backend on different domains

**Tasks not loading**
- Verify token in localStorage
- Check Authorization header format: `Bearer {token}`
- Ensure backend API is running
- Check browser console network tab

**Token expired errors**
- Token expires after configured time (check JWT_EXPIRES_IN)
- Login again to get new token
- Consider implementing token refresh

**Page doesn't redirect**
- Check localStorage has `accessToken`
- Clear browser cache
- Verify redirect logic in JavaScript

### Browser Console Commands

Check authentication:
```javascript
console.log(localStorage.getItem('accessToken'));
console.log(localStorage.getItem('username'));
```

Clear and reset:
```javascript
localStorage.clear();
location.reload();
```

## Security Notes

⚠️ **For Production**:
1. Use HTTPS only
2. Implement CSRF tokens
3. Add rate limiting
4. Use httpOnly cookies instead of localStorage
5. Add password strength requirements
6. Implement email verification
7. Add password reset flow
8. Enable 2FA option
9. Log security events
10. Regular security audits

## Browser Support

✅ **Fully Supported**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

⚠️ **Partial Support**:
- IE 11 (requires polyfills)

## Performance

- **Page size**: ~25KB (index.html), ~35KB (tasks.html)
- **Load time**: < 1s on good connection
- **No external dependencies**: Pure HTML/CSS/JS
- **Inline styles**: No external CSS requests

## Accessibility

- Semantic HTML elements
- Form labels associated with inputs
- Keyboard navigation support
- ARIA labels where appropriate
- Focus visible states

## Future Enhancements

Potential additions:
- [ ] Task search functionality
- [ ] Filter by priority
- [ ] Sort options (date, priority, title)
- [ ] Due date with date picker
- [ ] Task categories/tags
- [ ] Completed tasks toggle
- [ ] Dark mode
- [ ] Export to CSV/PDF
- [ ] Keyboard shortcuts
- [ ] Drag and drop reordering
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Subtasks
- [ ] File attachments

## Credits

Built with vanilla JavaScript, HTML5, and CSS3.
No frameworks or external libraries required.

## License

MIT
