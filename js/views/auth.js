/* ==========================================================================
   Wrench Wise EmployAI Login View
   ========================================================================== */

/**
 * Renders the login card structure into the target container.
 * @param {HTMLElement} container - Target content node
 * @param {Function} onLoginSuccess - Callback when login completes: (userObj, role) => {}
 */
export function renderLoginView(container, onLoginSuccess) {
    let selectedRole = 'counselor'; // default selector

    container.innerHTML = `
        <div class="login-container">
            <div class="glass-card login-card">
                <div class="login-header">
                    <div class="login-logo">
                        <i data-lucide="wrench"></i>
                    </div>
                    <h2>Wrench Wise EmployAI</h2>
                    <p>AI-Powered Employability & Transformation</p>
                </div>

                <form id="login-form" onsubmit="return false;">
                    <div class="form-group">
                        <label class="form-label" for="login-email">Work Email</label>
                        <div class="input-wrapper">
                            <i data-lucide="mail"></i>
                            <input 
                                type="email" 
                                id="login-email" 
                                class="form-input" 
                                placeholder="name@wrenchwise.com" 
                                value="neha.verma@wrenchwise.com" 
                                required
                            >
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="login-password">Password</label>
                        <div class="input-wrapper">
                            <i data-lucide="lock"></i>
                            <input 
                                type="password" 
                                id="login-password" 
                                class="form-input" 
                                placeholder="••••••••" 
                                value="password123" 
                                required
                            >
                        </div>
                    </div>

                    <button type="submit" id="btn-login-submit" class="btn-primary">
                        <span>Sign In</span>
                        <i data-lucide="arrow-right"></i>
                    </button>
                </form>

                <div class="login-options-divider">OR SELECT DEMO USER</div>

                <div class="role-switcher-grid">
                    <button type="button" class="btn-role-switch active" id="btn-role-counselor">
                        <i data-lucide="user-check" style="display:block; margin: 0 auto 4px; width: 16px; height: 16px;"></i>
                        Sales Counselor
                    </button>
                    <button type="button" class="btn-role-switch" id="btn-role-admin">
                        <i data-lucide="shield-check" style="display:block; margin: 0 auto 4px; width: 16px; height: 16px;"></i>
                        System Admin
                    </button>
                </div>
            </div>
        </div>
    `;

    // Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const roleCounselorBtn = document.getElementById('btn-role-counselor');
    const roleAdminBtn = document.getElementById('btn-role-admin');

    // Role selection changes email value for convenience
    roleCounselorBtn.addEventListener('click', () => {
        selectedRole = 'counselor';
        roleCounselorBtn.classList.add('active');
        roleAdminBtn.classList.remove('active');
        emailInput.value = "neha.verma@wrenchwise.com";
    });

    roleAdminBtn.addEventListener('click', () => {
        selectedRole = 'admin';
        roleAdminBtn.classList.add('active');
        roleCounselorBtn.classList.remove('active');
        emailInput.value = "admin.growth@wrenchwise.com";
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = emailInput.value;
        let user = {
            email: email,
            name: selectedRole === 'admin' ? 'Administrator' : 'Neha Verma',
            role: selectedRole
        };

        if (selectedRole === 'counselor') {
            user.id = 'sc_01'; // Neha Verma
        } else {
            user.id = 'admin_00';
        }

        onLoginSuccess(user, selectedRole);
    });
}
