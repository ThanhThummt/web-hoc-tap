/* ===== TIME & FOCUS MODULE ===== */
const TimeFocus = {
    // Pomodoro State
    duration: 25 * 60,
    timeLeft: 25 * 60,
    isRunning: false,
    timerInterval: null,
    sessionsCompleted: 0,
    currentSubject: null,

    // Audio State
    audioCtx: null,
    audioSource: null,
    audioGain: null,
    isPlaying: false,
    currentChannel: 'white-noise',

    init() {
        this.setupPomodoro();
        this.setupAudioPlayer();
        this.setupAICommand();
        this.renderDeadlines();
        this.renderCalendar();
        // Update deadlines every minute
        setInterval(() => this.renderDeadlines(), 60000);
    },

    // ===== POMODORO =====
    setupPomodoro() {
        const startBtn = document.getElementById('timerStart');
        const pauseBtn = document.getElementById('timerPause');
        const resetBtn = document.getElementById('timerReset');

        startBtn.addEventListener('click', () => this.start());
        pauseBtn.addEventListener('click', () => this.pause());
        resetBtn.addEventListener('click', () => this.reset());

        // Duration toggle
        document.querySelectorAll('.duration-toggle .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.duration-toggle .btn').forEach(b => { b.classList.remove('active', 'btn-primary'); b.classList.add('btn-secondary'); });
                btn.classList.add('active', 'btn-primary');
                btn.classList.remove('btn-secondary');
                this.duration = parseInt(btn.dataset.duration) * 60;
                this.reset();
            });
        });
    },

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.currentSubject = document.getElementById('pomodoroSubject').value;
        document.getElementById('timerCircle').classList.add('running');
        document.getElementById('timerStart').style.display = 'none';
        document.getElementById('timerPause').style.display = '';

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            if (this.timeLeft <= 0) {
                this.onComplete();
            }
        }, 1000);
    },

    pause() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        document.getElementById('timerCircle').classList.remove('running');
        document.getElementById('timerStart').style.display = '';
        document.getElementById('timerPause').style.display = 'none';
    },

    reset() {
        this.pause();
        this.timeLeft = this.duration;
        this.updateDisplay();
    },

    updateDisplay() {
        document.getElementById('timerDisplay').textContent = formatTime(this.timeLeft);
    },

    onComplete() {
        this.pause();
        this.sessionsCompleted++;
        document.getElementById('sessionCount').textContent = this.sessionsCompleted;
        this.timeLeft = this.duration;
        this.updateDisplay();

        // Play beep
        this.playBeep();

        // Award coins
        const mins = this.duration / 60;
        const coins = mins === 25 ? 10 : 20;
        if (typeof CharityHub !== 'undefined') CharityHub.awardCoins(coins, `Hoàn thành phiên Pomodoro ${mins} phút`);

        showToast(`🍅 Hoàn thành phiên ${mins} phút! +${coins} xu`, 'success');

        // Save study time
        this.recordStudyTime(mins);
    },

    playBeep() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 800;
            osc.type = 'sine';
            gain.gain.value = 0.3;
            osc.start();
            setTimeout(() => { osc.stop(); ctx.close(); }, 500);
        } catch (e) { /* silent fail */ }
    },

    recordStudyTime(minutes) {
        const data = JSON.parse(localStorage.getItem('webhoctap_study_log') || '[]');
        data.push({ date: new Date().toISOString(), minutes, subject: this.currentSubject });
        localStorage.setItem('webhoctap_study_log', JSON.stringify(data));
    },

    // ===== DEADLINE MANAGER =====
    renderDeadlines() {
        const container = document.getElementById('deadlineCards');
        if (!container || typeof StudyManager === 'undefined') return;

        const tasks = StudyManager.getAllTasks().filter(t => t.status !== 'done' && t.deadline);
        tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

        container.innerHTML = tasks.map(t => {
            const now = new Date();
            const dl = new Date(t.deadline);
            const diff = dl - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            let urgency = 'safe', urgencyLabel = '';
            if (diff < 0) { urgency = 'urgent'; urgencyLabel = '⚠️ Quá hạn!'; }
            else if (days < 1) { urgency = 'urgent'; urgencyLabel = `${hours} giờ`; }
            else if (days < 3) { urgency = 'warning'; urgencyLabel = `${days} ngày ${hours} giờ`; }
            else { urgencyLabel = `${days} ngày`; }

            return `
                <div class="card deadline-card ${urgency}">
                    <div class="deadline-subject">${t.subjectIcon} ${t.subjectName}</div>
                    <div class="deadline-title">${t.title}</div>
                    <div class="countdown-timer ${urgency}">${urgencyLabel}</div>
                    <div style="font-size:.8rem;color:var(--text-muted);margin-top:4px;">📅 ${formatDate(t.deadline)}</div>
                </div>`;
        }).join('') || '<p style="color:var(--text-secondary);grid-column:1/-1;text-align:center;padding:40px;">🎉 Không có deadline nào sắp tới!</p>';
    },

    // ===== CALENDAR =====
    renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        if (!grid) return;

        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday

        const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        let html = dayNames.map(d => `<div class="calendar-header">${d}</div>`).join('');

        const tasks = typeof StudyManager !== 'undefined' ? StudyManager.getAllTasks() : [];

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            const isToday = day.toDateString() === today.toDateString();
            const dayStr = day.toISOString().split('T')[0];
            const dayTasks = tasks.filter(t => t.deadline === dayStr);

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}">
                    <div class="calendar-day-num">${day.getDate()}/${day.getMonth() + 1}</div>
                    ${dayTasks.map(t => `<div class="calendar-event" style="background:${t.subjectColor}">${t.title}</div>`).join('')}
                </div>`;
        }
        grid.innerHTML = html;
    },

    // ===== AI COMMAND =====
    setupAICommand() {
        const micBtn = document.getElementById('aiMicBtn');
        const waveform = document.getElementById('waveform');
        let listening = false;

        micBtn.addEventListener('click', () => {
            if (listening) {
                listening = false;
                waveform.classList.remove('active');
                micBtn.textContent = '🎤 Bắt đầu nói';
                micBtn.classList.remove('btn-secondary');
                micBtn.classList.add('btn-danger');
                // Simulate AI result
                setTimeout(() => this.showAIResult(), 500);
            } else {
                listening = true;
                waveform.classList.add('active');
                micBtn.textContent = '⏹ Dừng lại';
                micBtn.classList.remove('btn-danger');
                micBtn.classList.add('btn-secondary');
                // Auto stop after 3 seconds
                setTimeout(() => { if (listening) micBtn.click(); }, 3000);
            }
        });
    },

    showAIResult() {
        const results = [
            { subject: 'Mạng máy tính', task: 'Nộp báo cáo giữa kỳ', deadline: '2026-10-15' },
            { subject: 'Lập trình Web', task: 'Hoàn thành Lab 5 React', deadline: '2026-10-12' }
        ];
        const content = document.getElementById('aiResultContent');
        content.innerHTML = `
            <p style="color:var(--text-secondary);margin-bottom:16px;">🤖 AI đã phân tích và tạo các nhiệm vụ sau:</p>
            ${results.map(r => `
                <div class="card" style="margin-bottom:10px;padding:14px;">
                    <div style="font-weight:600;">${r.task}</div>
                    <div style="font-size:.85rem;color:var(--text-secondary);">📖 ${r.subject} • 📅 ${formatDate(r.deadline)}</div>
                </div>
            `).join('')}
        `;
        openModal('modal-ai-result');
        showToast('🤖 AI đã phân tích lệnh thành công!', 'info');
    },

    // ===== AUDIO PLAYER =====
    setupAudioPlayer() {
        // Channel buttons
        document.querySelectorAll('.channel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.channel-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentChannel = btn.dataset.channel;
                if (this.isPlaying) { this.stopAudio(); this.playAudio(); }
            });
        });

        // Play button
        document.getElementById('audioPlayBtn').addEventListener('click', () => {
            if (this.isPlaying) { this.stopAudio(); }
            else { this.playAudio(); }
        });

        // Volume slider
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            if (this.audioGain) this.audioGain.gain.value = e.target.value / 100;
        });
    },

    playAudio() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.audioGain = this.audioCtx.createGain();
            this.audioGain.gain.value = document.getElementById('volumeSlider').value / 100;
            this.audioGain.connect(this.audioCtx.destination);

            if (this.currentChannel === 'white-noise') {
                const bufferSize = 2 * this.audioCtx.sampleRate;
                const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                this.audioSource = this.audioCtx.createBufferSource();
                this.audioSource.buffer = buffer;
                this.audioSource.loop = true;
                // Low pass filter for softer noise
                const filter = this.audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 1000;
                this.audioSource.connect(filter);
                filter.connect(this.audioGain);
                this.audioSource.start();
            } else if (this.currentChannel === 'lofi') {
                this.audioSource = this.audioCtx.createOscillator();
                this.audioSource.type = 'sine';
                this.audioSource.frequency.value = 174; // Solfeggio frequency
                const filter = this.audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 400;
                this.audioSource.connect(filter);
                filter.connect(this.audioGain);
                this.audioGain.gain.value *= 0.3;
                this.audioSource.start();
            } else {
                this.audioSource = this.audioCtx.createOscillator();
                this.audioSource.type = 'sine';
                this.audioSource.frequency.value = 40; // Gamma binaural
                this.audioSource.connect(this.audioGain);
                this.audioGain.gain.value *= 0.15;
                this.audioSource.start();
            }

            this.isPlaying = true;
            document.getElementById('audioPlayBtn').textContent = '⏸ Dừng';
            document.getElementById('visualizerBars').classList.add('playing');
        } catch (e) {
            showToast('Không thể phát âm thanh', 'error');
        }
    },

    stopAudio() {
        try {
            if (this.audioSource) { this.audioSource.stop(); this.audioSource = null; }
            if (this.audioCtx) { this.audioCtx.close(); this.audioCtx = null; }
        } catch (e) { /* ok */ }
        this.isPlaying = false;
        document.getElementById('audioPlayBtn').textContent = '▶ Phát';
        document.getElementById('visualizerBars').classList.remove('playing');
    }
};
