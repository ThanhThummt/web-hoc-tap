/* ===== STUDY MANAGER MODULE ===== */
const StudyManager = {
    subjects: [],
    currentSubjectId: null,

    defaultSubjects: [
        { id: 's1', name: 'Mạng máy tính', icon: '🖥️', color: '#6C63FF',
          files: [{ name: 'Chương 1 - Tổng quan.pdf', type: 'pdf', size: '2.4 MB' }, { name: 'Slide Bài giảng Tuần 3.pptx', type: 'slide', size: '5.1 MB' }, { name: 'Bài tập Chương 2.pdf', type: 'pdf', size: '1.2 MB' }],
          links: [{ title: 'Video bài giảng TCP/IP - YouTube', url: 'https://youtube.com' }, { title: 'Tài liệu tham khảo - Cisco', url: 'https://cisco.com' }],
          images: ['📸', '📷', '🖼️'],
          notes: '<h2>Chương 1: Tổng quan về Mạng máy tính</h2><p>Mạng máy tính là hệ thống các máy tính được kết nối với nhau...</p><ul><li>Mô hình OSI gồm 7 tầng</li><li>Mô hình TCP/IP gồm 4 tầng</li></ul>',
          tasks: [{ id: 't1', title: 'Bài tập chương 1', status: 'done', deadline: '2026-10-05' }, { id: 't2', title: 'Báo cáo giữa kỳ', status: 'doing', deadline: '2026-10-15' }, { id: 't3', title: 'Đồ án cuối kỳ', status: 'todo', deadline: '2026-11-20' }],
          progress: 45 },
        { id: 's2', name: 'Tiếng Nhật N3', icon: '🇯🇵', color: '#FF6B6B',
          files: [{ name: 'Minna no Nihongo Bài 25.pdf', type: 'pdf', size: '1.8 MB' }, { name: 'Ngữ pháp N3 tổng hợp.pdf', type: 'pdf', size: '3.2 MB' }],
          links: [{ title: 'JLPT Practice - NHK World', url: 'https://nhk.or.jp' }],
          images: ['📸'],
          notes: '<h2>文法 N3 - Ngữ pháp N3</h2><p>Ôn tập các mẫu ngữ pháp quan trọng...</p>',
          tasks: [{ id: 't4', title: 'Học Kanji bài 25-26', status: 'doing', deadline: '2026-10-08' }, { id: 't5', title: 'Thi thử JLPT N3', status: 'todo', deadline: '2026-10-25' }],
          progress: 30 },
        { id: 's3', name: 'Lập trình Web', icon: '💻', color: '#4CAF50',
          files: [{ name: 'Lab 4 - JavaScript.pdf', type: 'pdf', size: '890 KB' }, { name: 'Slide HTML-CSS cơ bản.pptx', type: 'slide', size: '4.5 MB' }],
          links: [{ title: 'MDN Web Docs', url: 'https://developer.mozilla.org' }, { title: 'W3Schools', url: 'https://w3schools.com' }],
          images: ['📸', '📷'],
          notes: '',
          tasks: [{ id: 't6', title: 'Lab 4 JavaScript', status: 'todo', deadline: '2026-10-10' }, { id: 't7', title: 'Project Website cá nhân', status: 'doing', deadline: '2026-11-01' }],
          progress: 60 },
        { id: 's4', name: 'Cơ sở dữ liệu', icon: '🗄️', color: '#FFB74D',
          files: [{ name: 'Giáo trình CSDL.pdf', type: 'pdf', size: '8.5 MB' }],
          links: [],
          images: [],
          notes: '',
          tasks: [{ id: 't8', title: 'Bài tập SQL chương 3', status: 'todo', deadline: '2026-10-12' }, { id: 't9', title: 'Thiết kế CSDL bệnh viện', status: 'todo', deadline: '2026-11-05' }],
          progress: 15 }
    ],

    init() {
        const saved = localStorage.getItem('webhoctap_subjects');
        this.subjects = saved ? JSON.parse(saved) : this.defaultSubjects;
        this.renderSubjects();
        this.setupBackButton();
        this.populateSubjectSelectors();
    },

    save() {
        localStorage.setItem('webhoctap_subjects', JSON.stringify(this.subjects));
    },

    renderSubjects() {
        const grid = document.getElementById('subjectGrid');
        if (!grid) return;
        grid.innerHTML = this.subjects.map(s => `
            <div class="card subject-card" onclick="StudyManager.openDetail('${s.id}')" style="--card-accent:${s.color}">
                <div class="subject-icon">${s.icon}</div>
                <div class="subject-name">${s.name}</div>
                <div class="subject-meta">
                    <span>📄 ${s.files.length} tài liệu</span>
                    <span>📋 ${s.tasks.length} task</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:${s.progress}%;background:linear-gradient(90deg,${s.color},${s.color}aa);"></div></div>
                <div style="font-size:.8rem;color:var(--text-secondary);margin-top:6px;">Tiến độ: ${s.progress}%</div>
            </div>
        `).join('');
    },

    openDetail(subjectId) {
        this.currentSubjectId = subjectId;
        const s = this.subjects.find(x => x.id === subjectId);
        if (!s) return;
        document.getElementById('subjectGrid').style.display = 'none';
        document.querySelector('.section-header').style.display = 'none';
        const detail = document.getElementById('subjectDetail');
        detail.style.display = 'block';
        document.getElementById('detailSubjectName').textContent = s.icon + ' ' + s.name;
        // Reset to first tab
        document.querySelectorAll('#subjectDetail .tab-item').forEach((t, i) => t.classList.toggle('active', i === 0));
        document.querySelectorAll('#subjectDetail .tab-content').forEach((tc, i) => { tc.style.display = i === 0 ? 'block' : 'none'; });
        this.renderFiles(s);
        this.renderLinks(s);
        this.renderImages(s);
        this.loadNote(s);
        this.renderKanban(s);
    },

    setupBackButton() {
        document.getElementById('backToSubjects').addEventListener('click', () => {
            document.getElementById('subjectDetail').style.display = 'none';
            document.getElementById('subjectGrid').style.display = '';
            document.querySelector('#section-study-manager .section-header').style.display = '';
            this.currentSubjectId = null;
        });
    },

    renderFiles(s) {
        const list = document.getElementById('fileList');
        const icons = { pdf: '📄', slide: '📊', doc: '📝', image: '🖼️' };
        list.innerHTML = s.files.map(f => `
            <div class="file-item">
                <span class="file-icon">${icons[f.type] || '📁'}</span>
                <div class="file-info">
                    <div class="file-name">${f.name}</div>
                    <div class="file-meta">${f.size}</div>
                </div>
                <button class="btn btn-sm btn-secondary">⬇️</button>
            </div>
        `).join('');
    },

    renderLinks(s) {
        const list = document.getElementById('linkList');
        list.innerHTML = s.links.map(l => `
            <div class="link-item">
                <div class="link-icon">🔗</div>
                <div class="file-info">
                    <div class="file-name">${l.title}</div>
                    <div class="file-meta">${l.url}</div>
                </div>
                <button class="btn btn-sm btn-secondary" onclick="window.open('${l.url}','_blank')">Mở ↗</button>
            </div>
        `).join('');
    },

    renderImages(s) {
        const gallery = document.getElementById('imageGallery');
        let html = s.images.map((img, i) => `<div class="gallery-item">${img} Ảnh ${i + 1}</div>`).join('');
        html += '<div class="gallery-item" style="border:2px dashed var(--border);background:transparent;font-size:1.5rem;color:var(--text-muted);">+ Thêm ảnh</div>';
        gallery.innerHTML = html;
    },

    loadNote(s) {
        const editor = document.getElementById('noteEditor');
        editor.innerHTML = s.notes || '<p>Bắt đầu ghi chú tại đây...</p>';
    },

    saveNote() {
        const s = this.subjects.find(x => x.id === this.currentSubjectId);
        if (!s) return;
        s.notes = document.getElementById('noteEditor').innerHTML;
        this.save();
        showToast('💾 Đã lưu ghi chú!', 'success');
    },

    insertChecklist() {
        document.execCommand('insertHTML', false,
            '<div style="margin:4px 0;"><input type="checkbox" style="margin-right:8px;"> <span>Việc cần làm...</span></div>');
    },

    addLink() {
        const s = this.subjects.find(x => x.id === this.currentSubjectId);
        if (!s) { showToast('Vui lòng mở một môn học trước!', 'error'); return; }
        const title = document.getElementById('linkTitleInput').value.trim();
        const url = document.getElementById('linkUrlInput').value.trim();
        if (!title || !url) { showToast('Vui lòng nhập đủ thông tin!', 'error'); return; }
        s.links.push({ title, url });
        this.save();
        this.renderLinks(s);
        document.getElementById('linkTitleInput').value = '';
        document.getElementById('linkUrlInput').value = '';
        showToast('🔗 Đã lưu đường dẫn!', 'success');
    },

    renderKanban(s) {
        const board = document.getElementById('kanbanBoard');
        const columns = [
            { key: 'todo', label: '📋 Chưa làm', color: 'var(--accent)' },
            { key: 'doing', label: '🔄 Đang làm', color: 'var(--accent-yellow)' },
            { key: 'done', label: '✅ Hoàn thành', color: 'var(--accent-green)' }
        ];
        board.innerHTML = columns.map(col => {
            const tasks = s.tasks.filter(t => t.status === col.key);
            return `
                <div class="kanban-column">
                    <div class="kanban-column-header">
                        <span>${col.label}</span>
                        <span class="badge badge-primary">${tasks.length}</span>
                    </div>
                    ${tasks.map(t => `
                        <div class="kanban-card">
                            <div class="kanban-task-title">${t.title}</div>
                            <div class="kanban-task-deadline">📅 ${formatDate(t.deadline)}</div>
                            <div class="kanban-task-actions">
                                ${col.key !== 'todo' ? `<button onclick="StudyManager.moveTask('${s.id}','${t.id}','${col.key === 'doing' ? 'todo' : 'doing'}')">← Lùi</button>` : ''}
                                ${col.key !== 'done' ? `<button onclick="StudyManager.moveTask('${s.id}','${t.id}','${col.key === 'todo' ? 'doing' : 'done'}')">Tiến →</button>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>`;
        }).join('');
    },

    moveTask(subjectId, taskId, newStatus) {
        const s = this.subjects.find(x => x.id === subjectId);
        const t = s.tasks.find(x => x.id === taskId);
        if (t) {
            t.status = newStatus;
            // Recalculate progress
            const done = s.tasks.filter(x => x.status === 'done').length;
            s.progress = Math.round((done / s.tasks.length) * 100);
            this.save();
            this.renderKanban(s);
            if (newStatus === 'done') {
                showToast('✅ Hoàn thành task: ' + t.title, 'success');
                if (typeof CharityHub !== 'undefined') CharityHub.awardCoins(25, 'Hoàn thành task');
            }
        }
    },

    createSubject() {
        const name = document.getElementById('newSubjectName').value.trim();
        if (!name) { showToast('Vui lòng nhập tên môn học!', 'error'); return; }
        const icon = document.querySelector('.icon-option.selected')?.dataset.icon || '📘';
        const colors = ['#6C63FF', '#FF6B6B', '#4CAF50', '#FFB74D', '#E91E63', '#00BCD4', '#9C27B0'];
        const newSubject = {
            id: generateId(), name, icon, color: colors[Math.floor(Math.random() * colors.length)],
            files: [], links: [], images: [], notes: '', tasks: [], progress: 0
        };
        this.subjects.push(newSubject);
        this.save();
        this.renderSubjects();
        this.populateSubjectSelectors();
        closeModal('modal-create-subject');
        document.getElementById('newSubjectName').value = '';
        showToast('📁 Đã tạo thư mục: ' + name, 'success');
    },

    createTask() {
        const s = this.subjects.find(x => x.id === this.currentSubjectId);
        if (!s) { showToast('Vui lòng mở một môn học trước!', 'error'); return; }
        const title = document.getElementById('newTaskTitle').value.trim();
        const deadline = document.getElementById('newTaskDeadline').value;
        const status = document.getElementById('newTaskStatus').value;
        if (!title) { showToast('Vui lòng nhập tên task!', 'error'); return; }
        s.tasks.push({ id: generateId(), title, status, deadline: deadline || '2026-12-31' });
        const done = s.tasks.filter(x => x.status === 'done').length;
        s.progress = Math.round((done / s.tasks.length) * 100);
        this.save();
        this.renderKanban(s);
        closeModal('modal-create-task');
        document.getElementById('newTaskTitle').value = '';
        showToast('📋 Đã thêm task: ' + title, 'success');
    },

    populateSubjectSelectors() {
        const selectors = [document.getElementById('pomodoroSubject')];
        selectors.forEach(sel => {
            if (!sel) return;
            const val = sel.value;
            sel.innerHTML = '<option value="">-- Chọn môn học --</option>' +
                this.subjects.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('');
            sel.value = val;
        });
    },

    getAllTasks() {
        let tasks = [];
        this.subjects.forEach(s => {
            s.tasks.forEach(t => {
                tasks.push({ ...t, subjectName: s.name, subjectIcon: s.icon, subjectColor: s.color });
            });
        });
        return tasks;
    }
};
