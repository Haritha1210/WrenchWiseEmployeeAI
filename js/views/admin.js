/* ==========================================================================
   Wrench Wise EmployAI Admin View
   ========================================================================== */

import { getStorageItem, setStorageItem, showToast } from '../utils.js';
import { extractProgramFromBrochure } from '../api/gemini.js';

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
    const programs = getStorageItem('wrenchwise_programs', []);

    container.innerHTML = `
        <h3 class="mb-24" style="color:var(--text-main); font-family:var(--font-heading);"><i data-lucide="award" style="vertical-align:middle; margin-right:8px; color:var(--primary-light);"></i>Program Benchmarks</h3>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:24px;">Configure the target thresholds that define whether a candidate profile is categorized as "Industry Ready".</p>
        
        <form id="benchmarks-form" onsubmit="return false;">
            ${programs.map((p, idx) => {
                const bench = benchmarks[p.id] || { skillsCount: 8, projectsCount: 4, certificationsCount: 1, industryToolsCount: 3 };
                const borderStyle = idx === programs.length - 1 ? '' : 'border-bottom:1px solid var(--border-color); padding-bottom:24px; margin-bottom:32px;';
                const headerColor = p.id === 'aiml' ? 'var(--primary-light)' : (p.id === 'fullstack' ? '#a855f7' : 'var(--secondary-light)');
                
                return `
                    <div style="${borderStyle}">
                        <h4 style="color:${headerColor}; margin-bottom:16px;">${p.name.split(':')[0]} Benchmarks</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="bench-${p.id}-skills">Target Skills Count</label>
                                <input type="number" id="bench-${p.id}-skills" class="form-input" value="${bench.skillsCount}" style="padding-left:16px;">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="bench-${p.id}-projects">Target Projects Count</label>
                                <input type="number" id="bench-${p.id}-projects" class="form-input" value="${bench.projectsCount}" style="padding-left:16px;">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="bench-${p.id}-certs">Target Certifications Count</label>
                                <input type="number" id="bench-${p.id}-certs" class="form-input" value="${bench.certificationsCount}" style="padding-left:16px;">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="bench-${p.id}-tools">Target Tools Count</label>
                                <input type="number" id="bench-${p.id}-tools" class="form-input" value="${bench.industryToolsCount || bench.toolsCount || 3}" style="padding-left:16px;">
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
            
            <button class="btn btn-primary w-full mt-24" id="btn-save-benchmarks" style="padding:12px;">
                <i data-lucide="save"></i> Save Benchmark Requirements
            </button>
        </form>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Save Benchmarks Action
    document.getElementById('btn-save-benchmarks').addEventListener('click', () => {
        programs.forEach(p => {
            benchmarks[p.id] = benchmarks[p.id] || {};
            benchmarks[p.id].skillsCount = parseInt(document.getElementById(`bench-${p.id}-skills`).value) || 5;
            benchmarks[p.id].projectsCount = parseInt(document.getElementById(`bench-${p.id}-projects`).value) || 2;
            benchmarks[p.id].certificationsCount = parseInt(document.getElementById(`bench-${p.id}-certs`).value) || 1;
            benchmarks[p.id].industryToolsCount = parseInt(document.getElementById(`bench-${p.id}-tools`).value) || 2;
            benchmarks[p.id].portfolioRequired = true;
            benchmarks[p.id].githubRequired = true;
            benchmarks[p.id].brandingOptimized = true;
            benchmarks[p.id].experienceMonths = 6;
        });

        setStorageItem('wrenchwise_benchmarks', benchmarks);
        showToast("Benchmarks updated successfully!", "success");
    });
}
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
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:24px;">Configure details of program tracks or automatically import a new dynamic path by dropping a course brochure syllabus.</p>
        
        <!-- dynamic brochure syllabus uploader dropzone -->
        <div class="glass-card mb-24" style="padding: 24px; border: 1px dashed var(--primary); background: rgba(0, 168, 150, 0.02); display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center; border-radius: var(--radius-md);">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(0, 168, 150, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
                <i data-lucide="file-plus" style="width: 24px; height: 24px;"></i>
            </div>
            <div>
                <h4 style="color: var(--text-main); font-weight: 700; margin-bottom: 4px; font-family: var(--font-heading);">Import Dynamic Program from Brochure</h4>
                <p style="color: var(--text-muted); font-size: 0.8rem; max-width: 500px; line-height: 1.5;">Drag & drop a syllabus PDF, txt, or image. Our Gemini Two-Pass parser compiles curriculum skills, verified credentials, hands-on capstone descriptions, and targets instantly.</p>
            </div>
            <input type="file" id="brochure-file-input" style="display: none;" accept=".pdf,.txt,.png,.jpg,.jpeg">
            <button class="btn btn-secondary" id="btn-trigger-brochure-upload" style="padding: 8px 16px; font-size: 0.85rem; border-radius: var(--radius-sm);">
                <i data-lucide="upload-cloud"></i> Select Brochure Syllabus
            </button>
        </div>

        <div class="report-tabs" style="margin-bottom: 20px; overflow-x: auto; display: flex; gap: 8px; padding-bottom: 4px;">
            ${programs.map((p, idx) => `
                <button class="tab-btn ${idx === activeProgIdx ? 'active' : ''}" data-idx="${idx}" style="white-space: nowrap;">${p.name.split(':')[0]}</button>
            `).join('')}
        </div>
        
        <div id="program-curriculum-form-box">
            <!-- Form rendered here -->
        </div>
    `;

    // Hook brochure trigger
    const triggerBtn = container.querySelector('#btn-trigger-brochure-upload');
    const fileInput = container.querySelector('#brochure-file-input');
    if (triggerBtn && fileInput) {
        triggerBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                handleBrochureUpload(fileInput.files[0]);
            }
        });
    }

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
 * Dynamic Brochure PDF/TXT Course Syllabus extraction and database integration
 */
async function handleBrochureUpload(file) {
    if (file.size > 10 * 1024 * 1024) {
        showToast("File size exceeds 10MB limit.", "error");
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'parsing-loader-overlay';
    overlay.innerHTML = `
        <div class="loader-content">
            <div class="progress-ring-container">
                <div class="progress-spinner"></div>
                <div class="progress-text-percent" id="parse-percentage">0%</div>
            </div>
            <div class="loader-title" id="parse-loader-status">Scanning brochure structure...</div>
            <div class="loader-subtitle">EmployAI Brochure Syllabus Parser Engine v3.0</div>
        </div>
    `;
    document.body.appendChild(overlay);

    let progress = 0;
    const statusMessages = [
        "Reading brochure document...",
        "Identifying program name & title...",
        "Extracting curriculum skills stack...",
        "Compiling hands-on project details...",
        "Extracting verified certifications...",
        "Synthesizing job role requirements...",
        "Finalizing custom track database..."
    ];

    const interval = setInterval(() => {
        if (progress < 90) {
            progress += Math.floor(Math.random() * 4) + 1;
            if (progress > 90) progress = 90;
            const pctEl = document.getElementById('parse-percentage');
            if (pctEl) pctEl.textContent = `${progress}%`;
            const msgIndex = Math.min(statusMessages.length - 1, Math.floor(progress / 14));
            const statusEl = document.getElementById('parse-loader-status');
            if (statusEl) statusEl.textContent = statusMessages[msgIndex];
        }
    }, 45);

    try {
        const keyResponse = await fetch('/api/get-gemini-key');
        if (!keyResponse.ok) throw new Error("Could not retrieve Gemini API key from proxy.");
        const keyData = await keyResponse.json();
        const apiKey = keyData.key;
        if (!apiKey) throw new Error("Gemini API key is not configured in Vercel/Render environments.");

        const fileExtension = file.name.split('.').pop().toLowerCase();
        let filePayload = null;

        if (fileExtension === 'txt') {
            const text = await file.text();
            filePayload = { type: 'text', data: text };
        } else {
            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const mimeType = fileExtension === 'pdf' ? 'application/pdf' : `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
            filePayload = { type: 'binary', mimeType, data: base64Data };
        }

        const parsed = await extractProgramFromBrochure(filePayload, apiKey);
        if (!parsed || !parsed.name) throw new Error("AI brochure parsing failed or returned malformed structure.");

        const slugId = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `program-${Date.now()}`;
        parsed.id = slugId;

        // Save programs
        const programs = getStorageItem('wrenchwise_programs', []);
        const idx = programs.findIndex(p => p.id === slugId);
        if (idx !== -1) {
            programs[idx] = parsed;
        } else {
            programs.push(parsed);
        }
        setStorageItem('wrenchwise_programs', programs);

        // Generate benchmarks
        const benchmarks = getStorageItem('wrenchwise_benchmarks', {});
        benchmarks[slugId] = {
            skillsCount: Math.max(5, Math.round(parsed.skills.length * 0.7)),
            projectsCount: Math.max(2, Math.round(parsed.projects.length * 0.6)),
            portfolioRequired: true,
            githubRequired: true,
            certificationsCount: Math.max(1, parsed.certifications.length),
            experienceMonths: 6,
            brandingOptimized: true,
            industryToolsCount: Math.max(2, Math.round((parsed.essentialTools || []).length * 0.8))
        };
        setStorageItem('wrenchwise_benchmarks', benchmarks);

        clearInterval(interval);
        const pctEl = document.getElementById('parse-percentage');
        if (pctEl) pctEl.textContent = "100%";
        const statusEl = document.getElementById('parse-loader-status');
        if (statusEl) statusEl.textContent = "Parsed successfully!";

        setTimeout(() => {
            overlay.remove();
            showToast(`Track "${parsed.name}" imported successfully!`, "success");
            renderActiveSubSection(); // refresh Admin panel
        }, 150);

    } catch (e) {
        clearInterval(interval);
        overlay.remove();
        showToast(e.message || "Failed to process brochure PDF.", "error");
    }
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
                const c = counselors[idx];
                const wasActive = c.active;
                c.active = !wasActive;
                setStorageItem('wrenchwise_counselors', counselors);
                showToast(`Counselor ${c.name} ${c.active ? 'enabled' : 'disabled'}!`, "success");
                
                // Mailto for new approvals
                if (!wasActive && c.active && c.email) {
                    const subject = encodeURIComponent("Wrench Wise EmployAI - Account Access Approved");
                    const body = encodeURIComponent(`Hi ${c.name},\n\nYour request for access to the Wrench Wise EmployAI platform has been approved!\n\nYou can now log in using your credentials.\n\nBest regards,\nAdmin Team`);
                    window.open(`mailto:${c.email}?subject=${subject}&body=${body}`, '_blank');
                }
                
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
