import { auth, isMockMode } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const errorMessage = document.getElementById('errorMessage');
const userEmailSpan = document.getElementById('userEmail');

// --- Login Logic ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;

        if (isMockMode) {
            // MOCK MODE: Bypass real Firebase auth for local demo
            setTimeout(() => {
                if (email === 'admin@myfitvybe.com' && password === 'Ravi@123') {
                    sessionStorage.setItem('mockAdminUser', email);
                    window.location.href = '/admin/dashboard.html';
                } else {
                    errorMessage.textContent = 'Invalid credentials. Use admin@myfitvybe.com / Ravi@123';
                    loginBtn.textContent = 'Login to Dashboard';
                    loginBtn.disabled = false;
                }
            }, 800);
            return;
        }

        // REAL FIREBASE AUTH
        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = '/admin/dashboard.html';
        } catch (error) {
            console.error(error);
            errorMessage.textContent = 'Invalid email or password.';
            loginBtn.textContent = 'Login to Dashboard';
            loginBtn.disabled = false;
        }
    });
}

// --- Route Protection & Auth State ---
// If we are on dashboard.html, check if user is logged in
if (window.location.pathname.includes('dashboard.html')) {
    
    if (isMockMode) {
        const mockUser = sessionStorage.getItem('mockAdminUser');
        if (!mockUser) {
            window.location.href = '/admin/'; // Redirect to login
        } else {
            if(userEmailSpan) userEmailSpan.textContent = mockUser + ' (Mock Mode)';
        }
    } else {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                if(userEmailSpan) userEmailSpan.textContent = user.email;
            } else {
                window.location.href = '/admin/'; // Redirect to login
            }
        });
    }
}

// --- Logout Logic ---
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (isMockMode) {
            sessionStorage.removeItem('mockAdminUser');
            window.location.href = '/admin/';
        } else {
            try {
                await signOut(auth);
                window.location.href = '/admin/';
            } catch (error) {
                console.error("Logout error", error);
            }
        }
    });
}
