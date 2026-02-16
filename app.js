// API Configuration
// Ganti dengan URL deployment Google Apps Script Anda
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbxUTRtp49EnxnK0jENDQQgIUzIrdE-AAaV7rXR0OC3ALA8DT-NcoBijdtHcH8U_pX-MeQ/exec';

// ======================
// API HELPER - CORS Compatible
// ======================

/**
 * Mengirim request ke Google Apps Script dengan CORS handling
 * Menggunakan GET dengan parameter untuk menghindari CORS preflight
 */
async function gasRequest(payload) {
    // Encode payload sebagai URL parameter untuk menghindari CORS preflight
    const encodedPayload = encodeURIComponent(JSON.stringify(payload));
    const url = `${GAS_API_URL}?payload=${encodedPayload}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('GAS Request error:', error);
        throw error;
    }
}

// ======================
// AUTH FUNCTIONS
// ======================

function checkAuth() {
    const userId = localStorage.getItem('user_id');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (!userId && currentPage === 'chat.html') {
        window.location.href = 'index.html';
    }
    
    if (userId && currentPage === 'index.html') {
        window.location.href = 'chat.html';
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorDiv = document.getElementById('loginError');
    
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';
    
    if (!email || !password) {
        showError(errorDiv, 'Please fill in all fields');
        return;
    }
    
    if (!validateEmail(email)) {
        showError(errorDiv, 'Please enter a valid email address');
        return;
    }
    
    loginBtn.disabled = true;
    loginBtn.textContent = '...';
    
    try {
        const data = await gasRequest({
            action: 'login',
            email: email,
            password: password
        });
        
        if (data.success) {
            localStorage.setItem('user_id', data.data.user_id);
            window.location.href = 'chat.html';
        } else {
            showError(errorDiv, data.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(errorDiv, 'Connection error. Please check your internet and try again.');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';
    }
}

async function register() {
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirm').value;
    const registerBtn = document.getElementById('registerBtn');
    const errorDiv = document.getElementById('registerError');
    
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';
    
    if (!email || !password || !confirmPassword) {
        showError(errorDiv, 'Please fill in all fields');
        return;
    }
    
    if (!validateEmail(email)) {
        showError(errorDiv, 'Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showError(errorDiv, 'Password must be at least 6 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        showError(errorDiv, 'Passwords do not match');
        return;
    }
    
    registerBtn.disabled = true;
    registerBtn.textContent = '...';
    
    try {
        const data = await gasRequest({
            action: 'register',
            email: email,
            password: password
        });
        
        if (data.success) {
            alert('Account created successfully! Please login.');
            switchTab('login');
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
            document.getElementById('registerConfirm').value = '';
        } else {
            showError(errorDiv, data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Register error:', error);
        showError(errorDiv, 'Connection error. Please check your internet and try again.');
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Create Account';
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user_id');
        window.location.href = 'index.html';
    }
}

// ======================
// CHAT FUNCTIONS
// ======================

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    const sendBtn = document.getElementById('sendBtn');
    const errorDiv = document.getElementById('errorMessage');
    
    errorDiv.classList.add('hidden');
    document.getElementById('errorText').textContent = '';
    
    if (!message) return;
    
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        window.location.href = 'index.html';
        return;
    }
    
    appendMessage('user', message);
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    const loadingId = appendMessage('ai', 'loading');
    sendBtn.disabled = true;
    
    try {
        const data = await gasRequest({
            action: 'chat',
            user_id: userId,
            message: message
        });
        
        removeMessage(loadingId);
        
        if (data.success) {
            appendMessage('ai', data.data.response);
        } else {
            let errorMessage = data.message || 'An error occurred. Please try again.';
            if (data.message && data.message.includes('daily')) {
                errorMessage = 'Daily message limit reached. Please try again tomorrow.';
            }
            showError(errorDiv, errorMessage);
            appendMessage('ai', `Error: ${errorMessage}`);
        }
    } catch (error) {
        console.error('Chat error:', error);
        removeMessage(loadingId);
        const errorMessage = 'Connection error. Please check your internet and try again.';
        showError(errorDiv, errorMessage);
        appendMessage('ai', `Error: ${errorMessage}`);
    } finally {
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

function appendMessage(role, text) {
    const chatContainer = document.getElementById('chatContainer');
    const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    messageDiv.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
    
    if (text === 'loading') {
        messageDiv.innerHTML = `
            <div class="flex items-center gap-2 max-w-xs px-4 py-3 rounded-2xl bg-gray-100">
                <div class="flex gap-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="max-w-xs sm:max-w-md px-4 py-3 rounded-2xl ${
                role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
            }">
                <p class="text-sm leading-relaxed break-words">${escapeHtml(text)}</p>
            </div>
        `;
    }
    
    chatContainer.appendChild(messageDiv);
    
    setTimeout(() => {
        chatContainer.parentElement.scrollTop = chatContainer.parentElement.scrollHeight;
    }, 0);
    
    return messageId;
}

function removeMessage(messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        messageElement.remove();
    }
}

// ======================
// UI FUNCTIONS
// ======================

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTab.classList.add('bg-white', 'shadow-sm', 'text-gray-900');
        loginTab.classList.remove('text-gray-500');
        registerTab.classList.remove('bg-white', 'shadow-sm', 'text-gray-900');
        registerTab.classList.add('text-gray-500');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginTab.classList.remove('bg-white', 'shadow-sm', 'text-gray-900');
        loginTab.classList.add('text-gray-500');
        registerTab.classList.add('bg-white', 'shadow-sm', 'text-gray-900');
        registerTab.classList.remove('text-gray-500');
    }
    
    document.getElementById('loginError').classList.add('hidden');
    document.getElementById('registerError').classList.add('hidden');
}

function showError(errorDiv, message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// ======================
// UTILITY FUNCTIONS
// ======================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function escapeHtml(text) {
    const map = {
        '&': '&',
        '<': '<',
        '>': '>',
        '"': '"',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

document.addEventListener('DOMContentLoaded', checkAuth);
