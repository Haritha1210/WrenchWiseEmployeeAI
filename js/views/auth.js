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
    const renderForm = () => {
        container.innerHTML = `
            <div class="login-container">
                <div class="glass-card login-card" style="width: 100%; max-width: 400px; padding: 40px; border-radius: var(--radius-lg);">
                    <div class="login-header" style="text-align: center; margin-bottom: 30px;">
                        <div class="login-logo" style="width: 60px; height: 60px; background: rgba(0, 168, 150, 0.1); color: var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                            <i data-lucide="shield-check" style="width: 32px; height: 32px;"></i>
                        </div>
                        <h2 style="font-size: 1.5rem; color: var(--text-dark); margin-bottom: 8px;">System Administration</h2>
                        <p style="color: var(--text-light); font-size: 0.9rem;">Sign in with your admin credentials</p>
                    </div>

                    <form id="auth-form" onsubmit="return false;">
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label class="form-label" for="login-email">Admin Email</label>
                            <div class="input-wrapper" style="position: relative;">
                                <i data-lucide="mail" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-light); width: 18px; height: 18px;"></i>
                                <input type="email" id="login-email" class="form-input" placeholder="admin@wrenchwise.com" style="padding-left: 44px; width: 100%;" required>
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
                        <a href="#" id="link-back-counselor" style="color: var(--primary); font-weight: 500; text-decoration: none;"><i data-lucide="arrow-left" style="width:14px; height:14px; vertical-align:middle; margin-right:4px;"></i>Back to Workspace</a>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Attach event listeners
        document.getElementById('link-back-counselor').addEventListener('click', (e) => {
            e.preventDefault();
            // Just reload to auto-login as counselor again
            window.location.reload();
        });

        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();

            // Admin Login Check
            if (email === 'admin@wrenchwise.com' && password === 'WWAdmin@123') {
                onLoginSuccess({ id: 'admin_00', name: 'Administrator', email: email, role: 'admin' }, 'admin');
                return;
            } else {
                showToast("Invalid admin credentials.", "error");
            }
        });
    };

    renderForm();
}
