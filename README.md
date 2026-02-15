# AI Feisty

A modern, minimalist frontend for AI chat application. Built with HTML, Tailwind CSS, and Vanilla JavaScript.

## Features

✨ Modern SaaS design
🔐 Secure authentication with Google Apps Script backend
💬 Real-time chat interface
📱 Fully responsive (mobile-first)
🚀 Ready for GitHub Pages deployment
⚡ No framework dependencies - pure vanilla JS
🎨 Beautiful animations and loading states
📍 Auto-scroll chat messages
🛡️ No API keys stored in frontend

## Project Structure

```
AI Feisty/
├── index.html           # Login & Register page
├── chat.html            # Chat interface
├── js/
│   └── app.js           # All JavaScript logic
├── css/
│   └── style.css        # Custom CSS & animations
└── README.md            # This file
```

## Setup

### 1. Clone or Download

```bash
git clone https://github.com/yourusername/feisty-ai.git
cd feisty-ai
```

### 2. Configure API Endpoint

Edit `js/app.js` and replace `YOUR_GAS_DEPLOYMENT_ID`:

```javascript
const GAS_API_URL = 'https://script.google.com/macros/d/YOUR_GAS_DEPLOYMENT_ID/usercontent';
```

### 3. Test Locally

```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx http-server
```

Visit `http://localhost:8000`

## Deploy to GitHub Pages

### 1. Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/feisty-ai.git
git branch -M main
git push -u origin main
```

### 2. Enable GitHub Pages

- Go to Settings → Pages
- Select `main` branch as source
- Your site will be live at `https://yourusername.github.io/feisty-ai`

### 3. Update Environment

Update the API_URL in production if needed.

## API Integration

This frontend sends requests to a Google Apps Script backend:

### Login Request

```javascript
POST /
Content-Type: application/json

{
  "action": "login",
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "user_id": "user123"
}
```

### Register Request

```javascript
POST /
Content-Type: application/json

{
  "action": "register",
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "message": "Account created"
}
```

### Chat Request

```javascript
POST /
Content-Type: application/json

{
  "action": "chat",
  "user_id": "user123",
  "message": "Hello AI"
}

// Response
{
  "success": true,
  "response": "Hello! How can I help?"
}
```

## Security Notes

✅ API keys are never stored in the frontend
✅ All sensitive operations happen on the backend
✅ Passwords are sent over HTTPS (when deployed with HTTPS)
✅ Authentication tokens stored securely (localStorage with user_id reference)
✅ HTML escaping prevents XSS attacks
✅ Input validation on client-side for UX
✅ Email validation formats

### Best Practices

- Always use HTTPS in production
- Keep the backend API private and secure
- Implement rate limiting on the backend
- Use secure password hashing on the backend
- Add CORS headers on the backend as needed
- Monitor for suspicious activity

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Technologies Used

- **HTML5** - Semantic markup
- **Tailwind CSS 3** - CDN-based styling
- **Vanilla JavaScript** - No framework
- **Google Apps Script** - Backend (recommended)

## Features Breakdown

### Authentication

- ✅ Login with email/password
- ✅ Register new account
- ✅ Session persistence with localStorage
- ✅ Auto-redirect based on auth state
- ✅ Logout functionality
- ✅ Form validation

### Chat

- ✅ Send messages
- ✅ Receive AI responses
- ✅ Auto-scroll to latest message
- ✅ Loading animations
- ✅ Error handling
- ✅ Daily limit handling
- ✅ Responsive chat bubbles
- ✅ Enter to send (Shift+Enter for newline)

### UI/UX

- ✅ Modern minimalist design
- ✅ Mobile-first responsive
- ✅ Smooth animations
- ✅ Loading indicators
- ✅ Error messages
- ✅ Textarea auto-resize
- ✅ Clean typography
- ✅ Consistent spacing

## Customization

### Change Colors

Edit Tailwind classes:
- Primary: Change `blue-600` to desired color
- Secondary: Change `green-600` to desired color
- Backgrounds: Change `bg-white`, `bg-gray-100`

### Adjust Chat Bubble Size

In `app.js`, modify the `max-w-xs sm:max-w-md` classes:

```javascript
// Larger bubbles
max-w-sm sm:max-w-xl
```

### Add Logo

Replace the "F" in the header with:

```html
<img src="logo.png" alt="Logo" class="w-10 h-10">
```

## Troubleshooting

### Not connecting to backend?

- Check the `GAS_API_URL` is correct
- Ensure backend is deployed and public
- Check browser console for errors

### Messages not sending?

- Verify user_id is in localStorage
- Check network tab for request/response
- Ensure backend is responding

### Styling issues?

- Clear browser cache
- Make sure Tailwind CDN is loaded
- Check for CSS conflicts

## Development Tips

### Debug Mode

Open browser console (F12) to see:
- Network requests
- Error messages
- Authentication status

### Test Data

Use temporary test accounts during development.

### Local Testing

```bash
# Simple server
python -m http.server 8000

# Watch for changes
npm install -g live-server
live-server
```

## License

MIT - Feel free to use for personal or commercial projects

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console errors
3. Verify backend API is working
4. Check GitHub Issues

## Changelog

### Version 1.0
- Initial release
- Login & Register
- Chat interface
- Responsive design
- GitHub Pages ready

---

Made with ❤️ for modern web development
