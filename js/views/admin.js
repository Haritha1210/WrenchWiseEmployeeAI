/* ==========================================================================
   Wrench Wise EmployAI Admin View
   ========================================================================== */

import { getStorageItem, setStorageItem, showToast } from '../utils.js';

let activeSubSection = 'weights'; // active panel: weights, benchmarks, programs, counselors

/**
 * Main entry to render the Admin Dashboard Configurator
 * @param {HTMLElement} container - Main content area
 */
export function renderAdminView(container) {
    container.innerHTML = `
        <div class="admin-grid">
            <!-- Left Admin Sub-Menu -->
            <div class="admin-sidebar-menu">
                <button class="admin-menu-item active" data-sub="weights">
                    <i data-lucide="sliders"></i>
                    <span>Scoring Framework</span>
                </button>
                <button class="admin-menu-item" data-sub="benchmarks">
                    <i data-lucide="award"></i>
                    <span>Benchmarks Config</span>
                </button>
                <button class="admin-menu-item" data-sub="programs">
                    <i data-lucide="book-open"></i>
                    <span>Program Curriculum</span>
                </button>
                <button class="admin-menu-item" data-sub="counselors">
                    <i data-lucide="users"></i>
                    <span>Manage Counselors</span>
                </button>
            </div>

            <!-- Right Sub-Content Panel -->
            <div class="glass-card" id="admin-sub-panel">
                <!-- Injected dynamically based on sub-selection -->
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Hook up Sub-Menu Items
    const menuItems = document.querySelectorAll('.admin-sidebar-menu button');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const sub = item.getAttribute('data-sub');
            activeSubSection = sub;

            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            renderActiveSubSection();
        });
    });

    // Render Initial Sub-Section
    renderActiveSubSection();
}

/**
 * Renders the active sub-section in the admin right panel
 */
function renderActiveSubSection() {
    const panel = document.getElementById('admin-sub-panel');
    if (!panel) return;

    if (activeSubSection === 'weights') {
        renderWeightsPanel(panel);
    } else if (activeSubSection === 'benchmarks') {
        renderBenchmarksPanel(panel);
    } else if (activeSubSection === 'programs') {
        renderProgramsPanel(panel);
    } else if (activeSubSection === 'counselors') {
        renderCounselorsPanel(panel);
    }
}

/**
 * 1. SCORING WEIGHTS PANEL
 */
function renderWeightsPanel(container) {
    const weights = getStorageItem('wrenchwise_weights', {});
    
    const calculateSum = () => {
        let sum = 0;
        document.querySelectorAll('.slider-input-range').forEach(slider => {
            sum += parseInt(slider.value);
        });
        return sum;
    };

    const updateSumDisplay = () => {
        const sum = calculateSum();
        const totalBox = document.getElementById('lbl-weights-total');
        if (totalBox) {
            totalBox.textContent = `${sum}%`;
            if (sum === 100) {
                totalBox.className = "weight-total-value valid";
                document.getElementById('btn-save-weights').disabled = false;
            } else {
                totalBox.className = "weight-total-value invalid";
                document.getElementById('btn-save-weights').disabled = true;
            }
        }
    };

    container.innerHTML = `
        <h3 class="mb-24" style="color:var(--text-main); font-family:var(--font-heading);"><i data-lucide="sliders" style="vertical-align:middle; margin-right:8px; color:var(--primary-light);"></i>Scoring Weights Framework</h3>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:24px;">Configure the mathematical weights for overall employability score evaluation. The sum total of all dimensions must equal exactly 100%.</p>
        
        <form id="weights-form" onsubmit="return false;">
            <div class="weight-sliders-list">
                ${Object.keys(weights).map(key => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return `
                        <div class="weight-slider-item">
                            <span class="form-label" style="margin-bottom:0; font-weight:600; color:var(--text-main);">${label}</span>
                            <input type="range" class="slider-input-range" id="weight-${key}" name="${key}" min="0" max="50" step="5" value="${weights[key]}">
                            <span class="weight-percentage-box" id="val-${key}">${weights[key]}%</span>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="weight-total-footer">
                <div>
                    <span class="weight-total-label">Total Scoring Sum:</span>
                </div>
                <div>
                    <span class="weight-total-value valid" id="lbl-weights-total">100%</span>
                </div>
            </div>
            
            <button class="btn btn-primary w-full mt-24" id="btn-save-weights" style="padding:12px;">
                <i data-lucide="save"></i> Save Scoring Formula
            </button>
        </form>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Hook up real-time slider changes
    Object.keys(weights).forEach(key => {
        const slider = document.getElementById(`weight-${key}`);
        const display = document.getElementById(`val-${key}`);
        slider.addEventListener('input', () => {
            display.textContent = `${slider.value}%`;
            updateSumDisplay();
        });
    });

    updateSumDisplay();

    // Save Action
    document.getElementById('btn-save-weights').addEventListener('click', () => {
        const sum = calculateSum();
        if (sum !== 100) {
            showToast("Scoring weights must sum up to exactly 100%.", "error");
            return;
        }

        const updatedWeights = {};
        Object.keys(weights).forEach(key => {
            updatedWeights[key] = parseInt(document.getElementById(`weight-${key}`).value);
        });

        setStorageItem('wrenchwise_weights', updatedWeights);
        showToast("Scoring weights updated successfully!", "success");
    });
}

/**
 * 2. BENCHMARKS CONFIG PANEL
 */
function renderBenchmarksPanel(container) {
    const benchmarks = getStorageItem('wrenchwise_benchmarks', {});

    container.innerHTML = `
        <h3 class="mb-24" style="color:var(--text-main); font-family:var(--font-heading);"><i data-lucide="award" style="vertical-align:middle; margin-right:8px; color:var(--primary-light);"></i>Program Benchmark Benchmarks</h3>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:24px;">Configure the target thresholds that define whether a candidate profile is categorized as "Industry Ready".</p>
        
        <form id="benchmarks-form" onsubmit="return false;">
            <!-- AI/ML Program Benchmarks -->
            <div style="margin-bottom:32px; border-bottom:1px solid var(--border-color); padding-bottom:24px;">
                <h4 style="color:var(--primary-light); margin-bottom:16px;">AI/ML Engineering Benchmarks</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="bench-aiml-skills">Target Skills Count</label>
                        <input type="number" id="bench-aiml-skills" class="form-input" value="${benchmarks.aiml.skillsCount}" style="padding-left:16px;">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="bench-aiml-projects">Target Projects Count</label>
                        <input type="number" id="bench-aiml-projects" class="form-input" value="${benchmarks.aiml.projectsCount}" style="padding-left:16px;">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="bench-aiml-certs">Target Certifications Count</label>
                        <input type="number" id="bench-aiml-certs" class="form-input" value="${benchmarks.aiml.certificationsCount}" style="padding-left:16px;">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="bench-aiml-tools">Target Tools Count</label>
                        <input type="number" id="bench-aiml-tools" class="form-input" value="${benchmarks.aiml.industryToolsCount}" style="padding-left:16px;">
                    </div>
                </div>
            </div>

            <!-- Full Stack Web Benchmarks -->
            <div style="margin-bottom:24px;">
                <h4 style="color:#a855f7; margin-bottom:16px;">Full Stack Development Benchmarks</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="bench-fullstack-skills">Target Skills Count</label>
                        <input type="number" id="bench-fullstack-skills" class="form-input" value="${benchmarks.fullstack.skillsCount}" style="padding-left:16px;">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="bench-fullstack-projects">Target Projects Count</label>
                        <input type="number" id="bench-fullstack-projects" class="form-input" value="${benchmarks.fullstack.projectsCount}" style="padding-left:16px;">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="bench-fullstack-certs">Target Certifications Count</label>
                        <input type="number" id="bench-fullstack-certs" class="form-input" value="${benchmarks.fullstack.certificationsCount}" style="padding-left:16px;">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="bench-fullstack-tools">Target Tools Count</label>
                        <input type="number" id="bench-fullstack-tools" class="form-input" value="${benchmarks.fullstack.industryToolsCount}" style="padding-left:16px;">
                    </div>
                </div>
            </div>
            
            <button class="btn btn-primary w-full mt-24" id="btn-save-benchmarks" style="padding:12px;">
                <i data-lucide="save"></i> Save Benchmark Requirements
            </button>
        </form>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Save Benchmarks Action
    document.getElementById('btn-save-benchmarks').addEventListener('click', () => {
        benchmarks.aiml.skillsCount = parseInt(document.getElementById('bench-aiml-skills').value);
        benchmarks.aiml.projectsCount = parseInt(document.getElementById('bench-aiml-projects').value);
        benchmarks.aiml.certificationsCount = parseInt(document.getElementById('bench-aiml-certs').value);
        benchmarks.aiml.industryToolsCount = parseInt(document.getElementById('bench-aiml-tools').value);

        benchmarks.fullstack.skillsCount = parseInt(document.getElementById('bench-fullstack-skills').value);
        benchmarks.fullstack.projectsCount = parseInt(document.getElementById('bench-fullstack-projects').value);
        benchmarks.fullstack.certificationsCount = parseInt(document.getElementById('bench-fullstack-certs').value);
        benchmarks.fullstack.industryToolsCount = parseInt(document.getElementById('bench-fullstack-tools').value);

        setStorageItem('wrenchwise_benchmarks', benchmarks);
        showToast("Benchmarks updated successfully!", "success");
    });
}

/**
 * 3. PROGRAMS MANAGEMENT PANEL
 */
function renderProgramsPanel(container) {
    const programs = getStorageItem('wrenchwise_programs', []);
    let activeProgIdx = 0; // aiml default active tab

    const renderActiveProgramForm = () => {
        const prog = programs[activeProgIdx];
        const progContainer = document.getElementById('program-curriculum-form-box');
        if (!progContainer) return;

        progContainer.innerHTML = `
            <div style="margin-top:20px; display:flex; flex-direction:column; gap:20px;">
                <div class="form-group">
                    <label class="form-label">Program Name</label>
                    <input type="text" id="prog-name" class="form-input" value="${prog.name}" style="padding-left:16px;">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Skills Curriculum</label>
                        <textarea id="prog-skills" class="form-input" rows="4" style="padding:12px; font-family:monospace; line-height:1.5;">${prog.skills.join(', ')}</textarea>
                        <span style="font-size:0.75rem; color:var(--text-muted);">Separate skills with commas</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Pre-defined Projects</label>
                        <textarea id="prog-projects" class="form-input" rows="4" style="padding:12px; font-family:monospace; line-height:1.5;">${prog.projects.join(', ')}</textarea>
                        <span style="font-size:0.75rem; color:var(--text-muted);">Separate projects with commas</span>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Verified Certifications Gained</label>
                    <textarea id="prog-certs" class="form-input" rows="2" style="padding:12px; font-family:monospace; line-height:1.5;">${prog.certifications.join(', ')}</textarea>
                    <span style="font-size:0.75rem; color:var(--text-muted);">Separate certifications with commas</span>
                </div>
                
                <button class="btn btn-primary" id="btn-save-program" style="padding:12px; align-self: flex-end;">
                    <i data-lucide="check"></i> Save Program Configuration
                </button>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();

        // Save Action
        document.getElementById('btn-save-program').addEventListener('click', () => {
            prog.name = document.getElementById('prog-name').value;
            prog.skills = document.getElementById('prog-skills').value.split(',').map(s=>s.trim()).filter(Boolean);
            prog.projects = document.getElementById('prog-projects').value.split(',').map(s=>s.trim()).filter(Boolean);
            prog.certifications = document.getElementById('prog-certs').value.split(',').map(s=>s.trim()).filter(Boolean);

            programs[activeProgIdx] = prog;
            setStorageItem('wrenchwise_programs', programs);
            showToast(`${prog.name} configuration updated successfully!`, "success");
        });
    };

    container.innerHTML = `
        <h3 class="mb-24" style="color:var(--text-main); font-family:var(--font-heading);"><i data-lucide="book-open" style="vertical-align:middle; margin-right:8px; color:var(--primary-light);"></i>Program Management</h3>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:24px;">Configure the details of program repositories, including core syllabus skills, project names, and earned certifications.</p>
        
        <div class="report-tabs" style="margin-bottom: 20px;">
            ${programs.map((p, idx) => `
                <button class="tab-btn ${idx === activeProgIdx ? 'active' : ''}" data-idx="${idx}">${p.name}</button>
            `).join('')}
        </div>
        
        <div id="program-curriculum-form-box">
            <!-- Form rendered here -->
        </div>
    `;

    // Hook tab switches
    const tabBtns = container.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            activeProgIdx = parseInt(btn.getAttribute('data-idx'));
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderActiveProgramForm();
        });
    });

    renderActiveProgramForm();
}

/**
 * 4. USER COUNSELORS PANEL
 */
function renderCounselorsPanel(container) {
    let counselors = getStorageItem('wrenchwise_counselors', []);

    const renderCounselorTable = () => {
        const tableBody = document.getElementById('counselor-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = counselors.map((sc, index) => `
            <tr>
                <td style="color:var(--text-main); font-weight:600;">${sc.name}</td>
                <td style="color:var(--text-muted);">${sc.email}</td>
                <td>
                    <span class="detail-value badge ${sc.active ? 'badge-yes' : 'badge-no'}">
                        ${sc.active ? 'Active' : 'Disabled'}
                    </span>
                </td>
                <td style="display:flex; gap:8px;">
                    <button class="btn-icon-only btn-toggle ${sc.active ? 'danger' : 'success'}" data-index="${index}" title="${sc.active ? 'Disable Counselor' : 'Enable Counselor'}">
                        <i data-lucide="${sc.active ? 'user-x' : 'user-check'}"></i>
                    </button>
                    <button class="btn-icon-only btn-delete danger" data-index="${index}" title="Delete Counselor">
                        <i data-lucide="trash-2"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        if (window.lucide) window.lucide.createIcons();

        // Bind toggle action
        tableBody.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                counselors[idx].active = !counselors[idx].active;
                setStorageItem('wrenchwise_counselors', counselors);
                showToast(`Counselor ${counselors[idx].name} ${counselors[idx].active ? 'enabled' : 'disabled'}!`, "success");
                renderCounselorTable();
            });
        });

        // Bind delete action
        tableBody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                const name = counselors[idx].name;
                counselors.splice(idx, 1);
                setStorageItem('wrenchwise_counselors', counselors);
                showToast(`Counselor ${name} has been completely deleted.`, "success");
                renderCounselorTable();
            });
        });
    };

    container.innerHTML = `
        <h3 class="mb-24" style="color:var(--text-main); font-family:var(--font-heading);"><i data-lucide="users" style="vertical-align:middle; margin-right:8px; color:var(--primary-light);"></i>Sales Counselors Directory</h3>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:24px;">Manage Sales Counselor access credentials and active permissions.</p>
        
        <div style="display:grid; grid-template-columns: 1fr; gap:24px;">
            <!-- Counselor List Table -->
            <div class="glass-card" style="padding:0; border:none; box-shadow:none; overflow-x:auto;">
                <table class="config-table">
                    <thead>
                        <tr>
                            <th>Counselor Name</th>
                            <th>Email Address</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="counselor-table-body">
                        <!-- Content rendered here -->
                    </tbody>
                </table>
            </div>
        </div>
    `;

    renderCounselorTable();
}
