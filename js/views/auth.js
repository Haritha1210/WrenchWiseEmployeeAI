/* ==========================================================================
   Wrench Wise EmployAI Login View
   ========================================================================== */

import { getStorageItem, setStorageItem, showToast } from '../utils.js';

/**
 * Renders the login card structure into the target container.
 * @param {HTMLElement} container - Target content node
 * @param {Function} onLoginSuccess - Callback when login completes: (userObj, role) => {}
 */
export function renderLoginView(container, onLoginSuccess) {
    let mode = 'login'; // 'login' or 'request'

    const renderForm = () => {
        container.innerHTML = `
            <div class="login-container">
                <div class="glass-card login-card" style="width: 100%; max-width: 400px; padding: 40px; border-radius: var(--radius-lg);">
                    <div class="login-header" style="text-align: center; margin-bottom: 30px;">
                        <div class="login-logo" style="width: 60px; height: 60px; background: rgba(0, 168, 150, 0.1); color: var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                            <i data-lucide="wrench" style="width: 32px; height: 32px;"></i>
                        </div>
                        <h2 style="font-size: 1.5rem; color: var(--text-dark); margin-bottom: 8px;">Wrench Wise EmployAI</h2>
                        <p style="color: var(--text-light); font-size: 0.9rem;">${mode === 'login' ? 'Sign in to your account' : 'Request access to the platform'}</p>
                    </div>

                    ${mode === 'login' ? `
                    <form id="auth-form" onsubmit="return false;">
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label class="form-label" for="login-email">Work Email</label>
                            <div class="input-wrapper" style="position: relative;">
                                <i data-lucide="mail" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-light); width: 18px; height: 18px;"></i>
                                <input type="email" id="login-email" class="form-input" placeholder="name@wrenchwise.com" style="padding-left: 44px; width: 100%;" required>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 24px;">
                            <label class="form-label" for="login-password">Password</label>
                            <div class="input-wrapper" style="position: relative;">
                                <i data-lucide="lock" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-light); width: 18px; height: 18px;"></i>
                                <input type="password" id="login-password" class="form-input" placeholder="••••••••" style="padding-left: 44px; width: 100%;" required>
                            </div>
                        </div>

                        <button type="submit" id="btn-submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 1rem; justify-content: center;">
                            <span>Sign In</span>
                            <i data-lucide="arrow-right" style="margin-left: 8px;"></i>
                        </button>
                    </form>
                    
                    <div style="text-align: center; margin-top: 24px;">
                        <span style="color: var(--text-light); font-size: 0.9rem;">Don't have an account? </span>
                        <a href="#" id="link-request-access" style="color: var(--primary); font-weight: 500; text-decoration: none;">Request Access</a>
                    </div>
                    ` : `
                    <form id="auth-form" onsubmit="return false;">
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label class="form-label" for="req-name">Full Name</label>
                            <div class="input-wrapper" style="position: relative;">
                                <i data-lucide="user" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-light); width: 18px; height: 18px;"></i>
                                <input type="text" id="req-name" class="form-input" placeholder="John Doe" style="padding-left: 44px; width: 100%;" required>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 24px;">
                            <label class="form-label" for="req-email">Work Email</label>
                            <div class="input-wrapper" style="position: relative;">
                                <i data-lucide="mail" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-light); width: 18px; height: 18px;"></i>
                                <input type="email" id="req-email" class="form-input" placeholder="name@wrenchwise.com" style="padding-left: 44px; width: 100%;" required>
                            </div>
                        </div>

                        <button type="submit" id="btn-submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 1rem; justify-content: center;">
                            <span>Submit Request</span>
                            <i data-lucide="send" style="margin-left: 8px;"></i>
                        </button>
                    </form>

                    <div style="text-align: center; margin-top: 24px;">
                        <span style="color: var(--text-light); font-size: 0.9rem;">Already have an account? </span>
                        <a href="#" id="link-back-login" style="color: var(--primary); font-weight: 500; text-decoration: none;">Back to Login</a>
                    </div>
                    `}
                </div>
            </div>
        `;

        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Attach event listeners
        if (mode === 'login') {
            document.getElementById('link-request-access').addEventListener('click', (e) => {
                e.preventDefault();
                mode = 'request';
                renderForm();
            });

            document.getElementById('auth-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value.trim();
                const password = document.getElementById('login-password').value.trim();

                // Admin Login Check
                if (email === 'admin@wrenchwise.com' && password === 'WWAdmin@123') {
                    onLoginSuccess({ id: 'admin_00', name: 'Administrator', email: email, role: 'admin' }, 'admin');
                    return;
                }

                // Counselor Login Check
                const counselors = getStorageItem('wrenchwise_counselors', []);
                const foundCounselor = counselors.find(c => c.email === email && c.active);

                if (foundCounselor) {
                    // Check default counselor password
                    if (password === 'Counselor@123') {
                        onLoginSuccess({ ...foundCounselor, role: 'counselor' }, 'counselor');
                    } else {
                        showToast("Invalid password. For existing counselors, use Counselor@123.", "error");
                    }
                } else {
                    showToast("Account not found or inactive. Please request access.", "error");
                }
            });
        } else {
            document.getElementById('link-back-login').addEventListener('click', (e) => {
                e.preventDefault();
                mode = 'login';
                renderForm();
            });

            document.getElementById('auth-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('req-name').value.trim();
                const email = document.getElementById('req-email').value.trim();

                let requests = getStorageItem('wrenchwise_access_requests', []);
                
                // Prevent duplicate requests
                if (requests.some(r => r.email === email)) {
                    showToast("An access request for this email already exists.", "warning");
                    return;
                }

                requests.push({
                    id: 'req_' + Date.now(),
                    name: name,
                    email: email,
                    date: new Date().toISOString(),
                    status: 'pending'
                });

                setStorageItem('wrenchwise_access_requests', requests);
                
                showToast("Access request submitted successfully! Pending admin approval.", "success");
                
                mode = 'login';
                renderForm();
            });
        }
    };

    renderForm();
}
