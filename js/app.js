/* ==========================================================================
   Wrench Wise EmployAI Main SPA Controller & Router
   ========================================================================== */

import { 
    DEFAULT_PROGRAMS, 
    DEFAULT_BENCHMARKS, 
    DEFAULT_SCORING_WEIGHTS, 
    INITIAL_COUNSELORS, 
    INITIAL_LEADS 
} from './data.js?v=3.3';
import { getStorageItem, setStorageItem, showToast } from './utils.js?v=3.3';
import { renderLoginView } from './views/auth.js?v=3.3';
import { renderCounselorView } from './views/counselor.js?v=3.3';
import { renderAdminView } from './views/admin.js?v=3.3';

// Application State
let currentUser = null;
let currentRole = null; // 'counselor' or 'admin'
let currentView = 'login'; // 'login', 'counselor', 'admin', 'analytics'

// Global captured error window handler to notify via Toast
window.onerror = function(message, source, lineno, colno, error) {
    const filename = source ? source.split('/').pop().split('?')[0] : "unknown";
    showToast(`System Error: ${message} (at ${filename}:${lineno})`, "error");
    console.error("Global captured error:", error);
    return false;
};

/**
 * Bootstraps the application on page load.
 */
function init() {
    // 1. Initialize Seed Data in localStorage if not already set or invalid (or using old signatures)
    const progData = getStorageItem('wrenchwise_programs', null);
    const isOldProg = progData && Array.isArray(progData) && (
        progData.some(p => p.name === "AI/ML Engineering Program" || p.name === "Full Stack Development with AI") ||
        !progData.some(p => p.roles !== undefined)
    );
    if (!progData || !Array.isArray(progData) || progData.length === 0 || isOldProg) {
        setStorageItem('wrenchwise_programs', DEFAULT_PROGRAMS);
        // Also reset benchmarks to match the new skill thresholds
        setStorageItem('wrenchwise_benchmarks', DEFAULT_BENCHMARKS);
    }

    const benchData = getStorageItem('wrenchwise_benchmarks', null);
    if (!benchData || !benchData.aiml || !benchData.fullstack) {
        setStorageItem('wrenchwise_benchmarks', DEFAULT_BENCHMARKS);
    }

    const weightData = getStorageItem('wrenchwise_weights', null);
    if (!weightData || typeof weightData !== 'object' || Object.keys(weightData).length === 0) {
        setStorageItem('wrenchwise_weights', DEFAULT_SCORING_WEIGHTS);
    } else if (weightData.education !== undefined) {
        // Forcefully replace education with certifications
        weightData.certifications = weightData.education;
        delete weightData.education;
        setStorageItem('wrenchwise_weights', weightData);
    }

    const scData = getStorageItem('wrenchwise_counselors', null);
    if (!scData || !Array.isArray(scData) || scData.length === 0) {
        setStorageItem('wrenchwise_counselors', INITIAL_COUNSELORS);
    }

    const leadData = getStorageItem('wrenchwise_leads', null);
    if (!leadData || !Array.isArray(leadData) || leadData.length === 0) {
        setStorageItem('wrenchwise_leads', INITIAL_LEADS);
    }

    // 2. Check for existing session
    let savedUser = getStorageItem('wrenchwise_session_user', null);
    let savedRole = getStorageItem('wrenchwise_session_role', null);

    // If no session exists, or if the session is Admin (we don't want Admin to persist on reload)
    if (!savedUser || !savedRole || savedRole === 'admin') {
        savedUser = null;
        savedRole = null;
        localStorage.removeItem('wrenchwise_session_user');
        localStorage.removeItem('wrenchwise_session_role');
    }

    // Bind Core Shell UI Event Listeners
    bindShellEvents();

    if (savedUser && savedRole) {
        loginSuccess(savedUser, savedRole);
    } else {
        navigate('login');
    }

    if (window.lucide) window.lucide.createIcons();
}

/**
 * Setup navigation and topbar events
 */
function bindShellEvents() {
    // Sidebar Mobile Toggle
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
    });

    // Logout Action
    document.getElementById('btn-auth-toggle').addEventListener('click', () => {
        logout();
    });


}

/**
 * Handles successful authentication login
 */
function loginSuccess(user, role) {
    currentUser = user;
    currentRole = role;

    // Persist session
    setStorageItem('wrenchwise_session_user', user);
    setStorageItem('wrenchwise_session_role', role);

    // Update top bar button text
    const btnAuth = document.getElementById('btn-auth-toggle');
    if (btnAuth) {
        if (role === 'admin') {
            btnAuth.innerHTML = '<i data-lucide="log-out" style="width: 18px; height: 18px;"></i><span>Logout</span>';
            btnAuth.title = "Log Out";
        } else {
            btnAuth.innerHTML = '<i data-lucide="shield" style="width: 18px; height: 18px;"></i><span>Admin Login</span>';
            btnAuth.title = "Admin Login";
        }
        if (window.lucide) window.lucide.createIcons();
    }

    // Update Shell Layout elements
    document.getElementById('sidebar').classList.remove('hidden');
    document.querySelector('.app-header').classList.remove('hidden');
    
    // Set Profile details in Sidebar footer
    const displayName = user ? user.name : "Guest Counselor";
    document.getElementById('nav-user-name').textContent = displayName;
    document.getElementById('nav-user-role').textContent = role === 'admin' ? 'System Administrator' : 'Sales Counselor';
    document.getElementById('nav-user-avatar').textContent = displayName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
    
    // Update topbar role indicator badge
    const badge = document.getElementById('role-badge');
    badge.textContent = role === 'admin' ? 'Admin' : 'Counselor';
    badge.className = `role-badge ${role === 'admin' ? 'admin' : 'counselor'}`;

    // Render Header Navigation Menu depending on user role
    renderHeaderMenu();

    // Route to default page
    if (role === 'counselor') {
        navigate('counselor');
    } else {
        navigate('admin'); // Admin default screen
    }

    showToast(`Logged in successfully as ${user.name}!`, "success");
}

/**
 * Logs out user and destroys sessions
 */
function logout() {
    localStorage.removeItem('wrenchwise_session_user');
    localStorage.removeItem('wrenchwise_session_role');
    
    if (currentRole === 'admin') {
        // Logging out of Admin returns to Counselor view
        currentUser = null;
        currentRole = null;
        init(); // Re-inits default counselor session
        showToast("Logged out of Admin.", "info");
        // Counselors clicking Admin Login go to login page (now just logs out everyone to login)
        currentUser = null;
        currentRole = null;
        
        // Hide shell elements
        document.getElementById('sidebar').classList.add('hidden');
        document.querySelector('.app-header').classList.add('hidden');
        
        navigate('login');
    }
}

/**
 * Renders navigation tabs inside the top header dynamically based on active role
 */
function renderHeaderMenu() {
    const headerLeft = document.querySelector('.header-left');
    if (!headerLeft) return;

    // Check if we already have the links container, if not create it
    let navContainer = document.getElementById('header-nav-links');
    if (!navContainer) {
        navContainer = document.createElement('div');
        navContainer.id = 'header-nav-links';
        navContainer.className = 'header-nav-links';
        navContainer.style.display = 'flex';
        navContainer.style.gap = '12px';
        navContainer.style.marginLeft = '24px';
        headerLeft.appendChild(navContainer);
    }

    if (currentRole === 'counselor') {
        navContainer.innerHTML = `
            <a class="header-nav-tab active" data-view="counselor">
                Assess Resume
            </a>
        `;
    } else if (currentRole === 'admin') {
        navContainer.innerHTML = `
            <a class="header-nav-tab ${currentView === 'counselor' ? 'active' : ''}" data-view="counselor">
                Counselor Panel
            </a>
            <a class="header-nav-tab ${currentView === 'admin' ? 'active' : ''}" data-view="admin">
                System Config
            </a>
        `;
    }

    // Bind click events
    const tabs = navContainer.querySelectorAll('.header-nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const view = tab.getAttribute('data-view');
            navigate(view);
        });
    });
}

/**
 * Main Single Page Application Router routing system
 */
function navigate(viewName) {
    currentView = viewName;
    const contentArea = document.getElementById('page-content');
    const titleArea = document.getElementById('page-title');
    
    if (!contentArea) return;

    // Reset layout title
    if (viewName === 'login') {
        document.getElementById('sidebar').classList.add('hidden');
        document.querySelector('.app-header').classList.add('hidden');
        renderLoginView(contentArea, loginSuccess);
        return;
    } else if (viewName === 'counselor') {
        titleArea.textContent = '';
        renderCounselorView(contentArea, currentUser);
    } else if (viewName === 'admin') {
        titleArea.textContent = 'System Configuration';
        renderAdminView(contentArea);
    }

    // Update active nav links in header
    renderHeaderMenu();
}

// Start Application on Load
window.addEventListener('DOMContentLoaded', init);
window.appNavigate = navigate;
export { navigate };
