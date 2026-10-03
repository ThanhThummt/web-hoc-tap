/* ===== APP.JS - Main Application Controller ===== */

// Utility Functions
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function formatPrice(p) {
    return formatNumber(p) + 'đ';
}
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
function debounce(fn, delay = 300) {
    let timer;
    return function (...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); };
}

// Modal System
function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
}

// Toast System
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => { requestAnimationFrame(() => { toast.classList.add('show'); }); });
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Update top bar coins display
function updateTopBarCoins(amount) {
    const el = document.getElementById('topBarCoins');
    if (el) el.textContent = formatNumber(amount);
}

document.addEventListener('DOMContentLoaded', function () {
    // ===== NAVIGATION =====
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    function switchSection(sectionName) {
        navItems.forEach(n => n.classList.remove('active'));
        sections.forEach(s => { s.style.display = 'none'; s.classList.remove('active'); });
        const activeNav = document.querySelector(`.nav-item[data-section="${sectionName}"]`);
        const activeSection = document.getElementById(`section-${sectionName}`);
        if (activeNav) activeNav.classList.add('active');
        if (activeSection) { activeSection.style.display = 'block'; activeSection.classList.add('active'); }
        if (sectionName === 'time-focus' && typeof TimeFocus !== 'undefined') {
            TimeFocus.renderDeadlines();
            TimeFocus.renderCalendar();
        }
        localStorage.setItem('webhoctap_active_section', sectionName);
        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => switchSection(item.dataset.section));
    });

    // Restore last active section
    const saved = localStorage.getItem('webhoctap_active_section');
    if (saved) switchSection(saved);

    // ===== THEME TOGGLE =====
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('webhoctap_theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️ Light Mode';
    }
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙 Dark Mode';
            localStorage.setItem('webhoctap_theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️ Light Mode';
            localStorage.setItem('webhoctap_theme', 'dark');
        }
    });

    // ===== MOBILE MENU =====
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    // ===== MODAL CLOSE HANDLERS =====
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        }
    });

    // ===== ICON PICKER =====
    document.querySelectorAll('.icon-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });

    // ===== COLOR PICKER =====
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });

    // ===== AI VOICE BUTTON (top bar) =====
    document.getElementById('aiVoiceBtn').addEventListener('click', () => {
        switchSection('time-focus');
        setTimeout(() => {
            document.getElementById('aiMicBtn').click();
        }, 300);
    });

    // ===== SUBJECT DETAIL TABS =====
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabBar = tab.parentElement;
            tabBar.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(tc => { tc.style.display = 'none'; });
            const target = document.getElementById(tabName);
            if (target) target.style.display = 'block';
        });
    });

    // ===== GLOBAL SEARCH =====
    document.getElementById('globalSearch').addEventListener('input', debounce(function (e) {
        const q = e.target.value.toLowerCase().trim();
        if (!q) return;
        showToast(`Đang tìm: "${q}"...`, 'info');
    }, 500));

    // ===== FILE UPLOAD AREA =====
    const uploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = 'var(--primary)'; });
        uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            showToast('Đã tải lên ' + e.dataTransfer.files.length + ' file!', 'success');
        });
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) showToast('Đã tải lên ' + fileInput.files.length + ' file!', 'success');
        });
    }

    // Initialize all modules
    if (typeof StudyManager !== 'undefined') StudyManager.init();
    if (typeof TimeFocus !== 'undefined') TimeFocus.init();
    if (typeof Analytics !== 'undefined') Analytics.init();
    if (typeof CharityHub !== 'undefined') CharityHub.init();
    if (typeof Marketplace !== 'undefined') Marketplace.init();
    if (typeof StudyHub !== 'undefined') StudyHub.init();
});
