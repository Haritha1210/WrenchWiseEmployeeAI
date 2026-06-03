/* ==========================================================================
   Wrench Wise EmployAI Login View
   ========================================================================== */

import { getStorageItem, setStorageItem, showToast } from '../utils.js?v=2.1';

/**
 * Renders the login card structure into the target container.
 * @param {HTMLElement} container - Target content node
 * @param {Function} onLoginSuccess - Callback when login completes: (userObj, role) => {}
 */
export function renderLoginView(container, onLoginSuccess) {
    let mode = 'admin_login'; // 'admin_login', 'request'

    const renderForm = () => {
        let title, subtitle, icon, formContent, footerContent;

        if (mode === 'admin_login') {
            title = '';
            subtitle = 'Sign in with your secure credentials';
            icon = 'shield-check';
            formContent = `
                <div class="form-group" style="margin-bottom: 20px;">
                    <label class="form-label" for="login-email">Email Address</label>
                    <div class="input-wrapper" style="position: relative;">
                        <i data-lucide="mail" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); width: 18px; height: 18px;"></i>
                        <input type="email" id="login-email" class="form-input" placeholder="name@wrenchwise.com" style="padding-left: 44px; width: 100%;" required>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 24px;">
                    <label class="form-label" for="login-password">Password</label>
                    <div class="input-wrapper" style="position: relative;">
                        <i data-lucide="lock" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); width: 18px; height: 18px;"></i>
                        <input type="password" id="login-password" class="form-input" placeholder="••••••••" style="padding-left: 44px; width: 100%;" required>
                    </div>
                </div>
                <button type="submit" id="btn-submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 1rem; justify-content: center; background: var(--primary-gradient); color: #ffffff; border:none; box-shadow: 0 4px 14px var(--primary-glow);">
                    <span>Sign In</span>
                    <i data-lucide="arrow-right" style="margin-left: 8px;"></i>
                </button>
            `;
            footerContent = `
                <div style="text-align: center; margin-top: 24px; display:flex; flex-direction:column; gap:12px;">
                    <div>
                        <span style="color: var(--text-muted); font-size: 0.9rem;">Need to join the team? </span>
                        <a href="#" id="link-request-access" style="color: var(--primary); font-weight: 500; text-decoration: none; transition: color 0.2s;">Request Access</a>
                    </div>
                </div>
            `;
        } else if (mode === 'request') {
            title = 'Request Access';
            subtitle = 'Register a new employee profile';
            icon = 'user-plus';
            formContent = `
                <div class="form-group" style="margin-bottom: 20px;">
                    <label class="form-label" for="req-name">Full Name</label>
                    <div class="input-wrapper" style="position: relative;">
                        <i data-lucide="user" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); width: 18px; height: 18px;"></i>
                        <input type="text" id="req-name" class="form-input" placeholder="John Doe" style="padding-left: 44px; width: 100%;" required>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 24px;">
                    <label class="form-label" for="req-email">Work Email</label>
                    <div class="input-wrapper" style="position: relative;">
                        <i data-lucide="mail" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); width: 18px; height: 18px;"></i>
                        <input type="email" id="req-email" class="form-input" placeholder="name@wrenchwise.com" style="padding-left: 44px; width: 100%;" required>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label class="form-label" for="req-password">Password</label>
                    <div class="input-wrapper" style="position: relative;">
                        <i data-lucide="lock" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); width: 18px; height: 18px;"></i>
                        <input type="password" id="req-password" class="form-input" placeholder="••••••••" style="padding-left: 44px; width: 100%;" required>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 24px;">
                    <label class="form-label" for="req-confirm">Reconfirm Password</label>
                    <div class="input-wrapper" style="position: relative;">
                        <i data-lucide="lock" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); width: 18px; height: 18px;"></i>
                        <input type="password" id="req-confirm" class="form-input" placeholder="••••••••" style="padding-left: 44px; width: 100%;" required>
                    </div>
                </div>
                <button type="submit" id="btn-submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 1rem; justify-content: center; background: var(--primary-gradient); color: #ffffff; border:none; box-shadow: 0 4px 14px var(--primary-glow);">
                    <span>Create Access</span>
                    <i data-lucide="send" style="margin-left: 8px;"></i>
                </button>
            `;
            footerContent = `
                <div style="text-align: center; margin-top: 24px;">
                    <span style="color: var(--text-muted); font-size: 0.9rem;">Already have access? </span>
                    <a href="#" id="link-back-login" style="color: var(--primary); font-weight: 500; text-decoration: none;">Back to Login</a>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="login-container" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at top right, rgba(0, 168, 150, 0.05), transparent 400px), var(--bg-light);">
                <div class="glass-card login-card" style="width: 100%; max-width: 420px; padding: 48px; border-radius: var(--radius-md); box-shadow: var(--shadow-lg); background: var(--card-bg); border: 1px solid var(--border-color); position: relative; overflow: hidden;">
                    <!-- Decorative Top Accent -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, var(--primary), var(--secondary));"></div>
                    
                    <div class="login-header" style="text-align: center; margin-bottom: 32px;">
                        <img src="assets/logo.png" alt="Wrench Wise EmployAI" style="width: 100%; max-width: 260px; height: auto; margin: 0 auto 20px auto; display: block;">
                        ${title ? `<h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">${title}</h2>` : ''}
                        <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5;">${subtitle}</p>
                    </div>

                    <form id="auth-form" onsubmit="return false;">
                        ${formContent}
                    </form>
                    
                    ${footerContent}
                </div>
                
                <!-- Background decorative elements -->
                <div style="position:fixed; bottom:-100px; left:-100px; width:400px; height:400px; background:radial-gradient(circle, rgba(0,168,150,0.03) 0%, transparent 70%); border-radius:50%; pointer-events:none;"></div>
                <div style="position:fixed; top:10%; right:5%; width:200px; height:200px; background:radial-gradient(circle, rgba(3,105,161,0.03) 0%, transparent 70%); border-radius:50%; pointer-events:none;"></div>
            </div>
        `;

        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Attach event listeners based on mode
        if (mode === 'admin_login') {
            document.getElementById('link-request-access').addEventListener('click', (e) => {
                e.preventDefault();
                mode = 'request';
                renderForm();
            });

            document.getElementById('auth-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value.trim();
                const password = document.getElementById('login-password').value.trim();

                if (email === 'admin@wrenchwise.com' && password === 'WWAdmin@123') {
                    onLoginSuccess({ id: 'admin_00', name: 'Administrator', email: email, role: 'admin' }, 'admin');
                } else {
                    const counselors = getStorageItem('wrenchwise_counselors', []);
                    const matchedCounselor = counselors.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);
                    
                    if (matchedCounselor) {
                        if (matchedCounselor.active) {
                            onLoginSuccess({ id: matchedCounselor.id, name: matchedCounselor.name, email: matchedCounselor.email, role: 'counselor' }, 'counselor');
                        } else {
                            showToast("Your account is pending admin approval.", "warning");
                        }
                    } else {
                        showToast("Invalid email or password.", "error");
                    }
                }
            });
        } else if (mode === 'request') {
            document.getElementById('link-back-login').addEventListener('click', (e) => {
                e.preventDefault();
                mode = 'admin_login';
                renderForm();
            });

            document.getElementById('auth-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('req-name').value.trim();
                const email = document.getElementById('req-email').value.trim();
                const password = document.getElementById('req-password').value;
                const confirm = document.getElementById('req-confirm').value;
                
                if (password !== confirm) {
                    showToast("Passwords do not match.", "error");
                    return;
                }

                let counselors = getStorageItem('wrenchwise_counselors', []);
                
                if (counselors.some(c => c.email.toLowerCase() === email.toLowerCase())) {
                    showToast("An employee with this email already exists.", "warning");
                    return;
                }

                counselors.unshift({
                    id: 'sc_' + Date.now(),
                    name: name,
                    email: email,
                    password: password,
                    active: false, // New requests need admin approval
                    assessmentsCount: 0,
                    enrollmentsCount: 0
                });
                
                setStorageItem('wrenchwise_counselors', counselors);
                showToast("Request submitted successfully! Pending admin approval.", "success");
                
                setTimeout(() => {
                    mode = 'admin_login';
                    renderForm();
                }, 1500);
            });
        }
    };

    renderForm();
}
