/* ===== STUDY HUB MODULE ===== */
const StudyHub = {
    matches: [
        { id: 'm1', name: 'Trần Minh Khoa', avatar: '👨‍💻', subjects: ['Lập trình Web', 'Cơ sở dữ liệu'], goals: ['IT', 'Fullstack'], compatibility: 92 },
        { id: 'm2', name: 'Nguyễn Thu Hà', avatar: '👩‍🎓', subjects: ['Tiếng Nhật N3', 'Mạng máy tính'], goals: ['JLPT N2', 'CCNA'], compatibility: 85 },
        { id: 'm3', name: 'Lê Hoàng Nam', avatar: '👨‍🔬', subjects: ['Mạng máy tính', 'Cơ sở dữ liệu'], goals: ['IT', 'Data'], compatibility: 78 },
        { id: 'm4', name: 'Phạm Thị Mai', avatar: '👩‍💼', subjects: ['Tiếng Nhật N3'], goals: ['JLPT N1', 'Du học'], compatibility: 88 }
    ],

    rooms: [
        { id: 'r1', name: 'Phòng ôn thi Mạng máy tính', subject: 'Mạng máy tính', participants: ['👨‍💻', '👩‍🎓', '👨‍🔬'], maxParticipants: 6, isLive: true },
        { id: 'r2', name: 'Luyện nghe JLPT N3', subject: 'Tiếng Nhật', participants: ['👩‍💼', '👨‍🎓'], maxParticipants: 4, isLive: true },
        { id: 'r3', name: 'Code cùng nhau - React', subject: 'Lập trình Web', participants: ['👨‍💻'], maxParticipants: 8, isLive: false }
    ],

    questions: [
        { id: 'q1', subject: 'Mạng máy tính', text: 'Cho em hỏi sự khác nhau giữa TCP và UDP trong trường hợp nào nên dùng giao thức nào?', author: 'Ẩn danh', answers: 5, upvotes: 12, time: '2 giờ trước' },
        { id: 'q2', subject: 'Cơ sở dữ liệu', text: 'Làm sao để tối ưu câu query JOIN nhiều bảng trong MySQL?', author: 'Ẩn danh', answers: 3, upvotes: 8, time: '5 giờ trước' },
        { id: 'q3', subject: 'Tiếng Nhật', text: 'Mọi người có tips gì để nhớ Kanji nhanh không? Em học hoài quên hoài 😭', author: 'Ẩn danh', answers: 8, upvotes: 25, time: 'Hôm qua' },
        { id: 'q4', subject: 'Lập trình Web', text: 'Event loop trong JavaScript hoạt động như thế nào? Ai giải thích đơn giản giùm em với!', author: 'Ẩn danh', answers: 6, upvotes: 15, time: 'Hôm qua' }
    ],

    postits: [
        { id: 'p1', text: 'Thi giữa kỳ xong rồi mà vẫn thấy lo lắm... Mong điểm tốt 🙏', color: '#FFEB3B', hearts: 24, time: '1 giờ trước' },
        { id: 'p2', text: 'Hôm nay học được 5 tiếng! Kỷ lục mới đây nè 💪🎉', color: '#4CAF50', hearts: 45, time: '3 giờ trước' },
        { id: 'p3', text: 'Đồ án deadline tuần sau mà chưa biết bắt đầu từ đâu 😭', color: '#FF9800', hearts: 31, time: '5 giờ trước' },
        { id: 'p4', text: 'Cảm ơn bạn chia sẻ note Mạng máy tính, quá hữu ích luôn! ❤️', color: '#E91E63', hearts: 18, time: 'Hôm qua' },
        { id: 'p5', text: 'Năm cuối rồi, cố lên mọi người! Sắp ra trường thôi nào 🎓', color: '#2196F3', hearts: 56, time: 'Hôm qua' },
        { id: 'p6', text: 'Ai học Tiếng Nhật N3 không, mình tìm bạn học cùng nè 🇯🇵', color: '#9C27B0', hearts: 12, time: '2 ngày trước' }
    ],

    postitColors: ['#FFEB3B', '#FF9800', '#E91E63', '#4CAF50', '#2196F3', '#9C27B0', '#00BCD4', '#FF5722', '#8BC34A', '#3F51B5'],

    init() {
        this.renderMatches();
        this.renderRooms();
        this.renderQuestions();
        this.renderPostits();
    },

    // ===== AI MATCHMAKING =====
    renderMatches() {
        const container = document.getElementById('matchResults');
        if (!container) return;

        container.innerHTML = this.matches.map(m => `
            <div class="card match-card">
                <div class="match-avatar">${m.avatar}</div>
                <div class="match-info">
                    <div class="match-name">${m.name}</div>
                    <div class="match-subjects">📖 ${m.subjects.join(', ')}</div>
                    <div class="match-tags">
                        ${m.goals.map(g => `<span class="tag">${g}</span>`).join('')}
                    </div>
                </div>
                <div style="text-align:center;">
                    <div class="compatibility">${m.compatibility}%</div>
                    <div style="font-size:.7rem;color:var(--text-muted);">phù hợp</div>
                    <button class="btn btn-primary btn-sm" style="margin-top:8px;" onclick="StudyHub.connectMatch('${m.name}')">🤝 Kết nối</button>
                </div>
            </div>
        `).join('');
    },

    matchBuddy() {
        const btn = document.getElementById('matchBtn');
        btn.disabled = true;
        btn.textContent = '🔄 AI đang tìm kiếm...';

        setTimeout(() => {
            // Shuffle & re-render with animation
            this.matches.sort(() => Math.random() - 0.5);
            this.matches.forEach(m => m.compatibility = Math.floor(Math.random() * 20) + 75);
            this.matches.sort((a, b) => b.compatibility - a.compatibility);
            this.renderMatches();

            btn.disabled = false;
            btn.textContent = '🤝 Ghép bạn học';
            showToast('🤝 AI đã tìm thấy bạn học phù hợp!', 'success');
        }, 2000);
    },

    connectMatch(name) {
        showToast(`🤝 Đã gửi lời mời kết bạn đến ${name}!`, 'success');
    },

    // ===== VOICE CALL ROOMS =====
    renderRooms() {
        const container = document.getElementById('roomList');
        if (!container) return;

        container.innerHTML = this.rooms.map(r => `
            <div class="card room-card">
                <div class="room-header">
                    <div class="room-name">${r.name}</div>
                    ${r.isLive ? '<div class="room-live">● LIVE</div>' : '<div style="font-size:.75rem;color:var(--text-muted);">Offline</div>'}
                </div>
                <div class="room-subject-tag">${r.subject}</div>
                <div class="room-participants">
                    ${r.participants.map(p => `<span>${p}</span>`).join('')}
                </div>
                <div class="room-meta">${r.participants.length}/${r.maxParticipants} người tham gia</div>
                <button class="btn ${r.isLive ? 'btn-primary' : 'btn-secondary'} btn-sm" style="width:100%;margin-top:12px;" onclick="StudyHub.joinRoom('${r.name}')">
                    ${r.isLive ? '🎧 Tham gia' : '📞 Vào phòng'}
                </button>
            </div>
        `).join('');
    },

    joinRoom(name) {
        showToast(`🎧 Đã tham gia: ${name}`, 'success');
    },

    createRoom() {
        const name = prompt('Tên phòng học:');
        if (!name) return;
        this.rooms.unshift({
            id: generateId(), name, subject: 'Chung',
            participants: ['👤'], maxParticipants: 8, isLive: true
        });
        this.renderRooms();
        showToast(`📞 Đã tạo phòng: ${name}`, 'success');
    },

    // ===== Q&A BOARD =====
    renderQuestions() {
        const container = document.getElementById('qaBoard');
        if (!container) return;

        container.innerHTML = this.questions.map(q => `
            <div class="card qa-card">
                <span class="qa-subject-tag">${q.subject}</span>
                <div class="qa-text">${q.text}</div>
                <div class="qa-footer">
                    <div class="qa-stats">
                        <span>💬 ${q.answers} câu trả lời</span>
                        <span>🕐 ${q.time}</span>
                    </div>
                    <button class="upvote-btn" onclick="StudyHub.upvoteQuestion('${q.id}')">
                        👍 <span>${q.upvotes}</span>
                    </button>
                </div>
            </div>
        `).join('');
    },

    upvoteQuestion(id) {
        const q = this.questions.find(x => x.id === id);
        if (q) {
            q.upvotes++;
            this.renderQuestions();
        }
    },

    askQuestion() {
        const subject = document.getElementById('questionSubject').value;
        const text = document.getElementById('questionText').value.trim();
        if (!text) { showToast('Vui lòng nhập nội dung câu hỏi!', 'error'); return; }

        this.questions.unshift({
            id: generateId(), subject, text, author: 'Ẩn danh',
            answers: 0, upvotes: 0, time: 'Vừa xong'
        });
        this.renderQuestions();
        closeModal('modal-ask-question');
        document.getElementById('questionText').value = '';
        showToast('❓ Đã đăng câu hỏi!', 'success');
    },

    // ===== POST-IT WALL =====
    renderPostits() {
        const container = document.getElementById('postitWall');
        if (!container) return;

        const isDark = (color) => {
            // Check if text should be white on this background
            const light = ['#FFEB3B', '#8BC34A'];
            return !light.includes(color);
        };

        container.innerHTML = this.postits.map(p => `
            <div class="postit-note" style="background:${p.color};color:${isDark(p.color) ? '#fff' : '#333'};">
                <div class="postit-text">${p.text}</div>
                <div class="postit-footer">
                    <span>${p.time}</span>
                    <span class="postit-hearts" onclick="StudyHub.heartPostit('${p.id}')">❤️ ${p.hearts}</span>
                </div>
            </div>
        `).join('');
    },

    heartPostit(id) {
        const p = this.postits.find(x => x.id === id);
        if (p) {
            p.hearts++;
            this.renderPostits();
            showToast('❤️ Đã thả tim!', 'success');
        }
    },

    writePostit() {
        const text = document.getElementById('postitText').value.trim();
        if (!text) { showToast('Vui lòng nhập nội dung!', 'error'); return; }

        const selectedColor = document.querySelector('#postitColorPicker .color-option.selected');
        const color = selectedColor?.dataset.color || this.postitColors[Math.floor(Math.random() * this.postitColors.length)];

        this.postits.unshift({
            id: generateId(), text, color, hearts: 0, time: 'Vừa xong'
        });
        this.renderPostits();
        closeModal('modal-write-postit');
        document.getElementById('postitText').value = '';
        showToast('✏️ Đã đăng tâm sự!', 'success');
    },

    // ===== SOCIAL =====
    sendEncouragement(name) {
        const messages = ['Cố lên bạn! 💪', 'Bạn làm tốt lắm! 🌟', 'Mình tin bạn! ❤️', 'Fighting! 🔥'];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        showToast(`💌 Đã gửi "${msg}" đến ${name}`, 'success');
    },

    giveCoins(name, amount) {
        if (typeof CharityHub !== 'undefined' && CharityHub.coinBalance >= amount) {
            CharityHub.coinBalance -= amount;
            CharityHub.save();
            CharityHub.renderWallet();
            showToast(`🎁 Đã tặng ${amount} xu cho ${name}!`, 'success');
        } else {
            showToast('Bạn không đủ xu!', 'error');
        }
    }
};
