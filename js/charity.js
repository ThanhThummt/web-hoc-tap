/* ===== CHARITY HUB MODULE ===== */
const CharityHub = {
    coinBalance: 1250,
    totalDonated: 0,
    communityTotal: 15000,
    adWatchesRemaining: 5,
    adWatchDate: null,

    earningHistory: [
        { action: 'Hoàn thành phiên Pomodoro 25p', coins: 10, time: '2 giờ trước' },
        { action: 'Nộp bài đúng hạn - Mạng máy tính', coins: 25, time: '5 giờ trước' },
        { action: 'Xem quảng cáo', coins: 5, time: 'Hôm qua' },
        { action: 'Streak 7 ngày liên tiếp', coins: 50, time: '3 ngày trước' },
        { action: 'Hoàn thành phiên Pomodoro 50p', coins: 20, time: '3 ngày trước' },
        { action: 'Chia sẻ tài liệu lên Sàn', coins: 15, time: '5 ngày trước' }
    ],

    init() {
        const saved = localStorage.getItem('webhoctap_charity');
        if (saved) {
            const data = JSON.parse(saved);
            this.coinBalance = data.coinBalance ?? 1250;
            this.totalDonated = data.totalDonated ?? 0;
            this.communityTotal = data.communityTotal ?? 15000;
            this.adWatchDate = data.adWatchDate;
            this.adWatchesRemaining = data.adWatchesRemaining ?? 5;
        }
        // Reset daily ad watches
        const today = new Date().toDateString();
        if (this.adWatchDate !== today) {
            this.adWatchesRemaining = 5;
            this.adWatchDate = today;
        }
        this.render();
    },

    save() {
        localStorage.setItem('webhoctap_charity', JSON.stringify({
            coinBalance: this.coinBalance,
            totalDonated: this.totalDonated,
            communityTotal: this.communityTotal,
            adWatchDate: this.adWatchDate,
            adWatchesRemaining: this.adWatchesRemaining
        }));
        updateTopBarCoins(this.coinBalance);
    },

    render() {
        this.renderWallet();
        this.renderTree();
        this.renderAdWatches();
        updateTopBarCoins(this.coinBalance);
    },

    renderWallet() {
        document.getElementById('walletBalance').textContent = formatNumber(this.coinBalance);
        document.getElementById('communityDonated').textContent = formatNumber(this.communityTotal);

        const historyEl = document.getElementById('earningHistory');
        if (historyEl) {
            historyEl.innerHTML = this.earningHistory.map(e => `
                <div class="earning-item">
                    <div>
                        <div class="earning-action">${e.action}</div>
                        <div class="earning-time">${e.time}</div>
                    </div>
                    <div class="earning-coins">+${e.coins} 🍃</div>
                </div>
            `).join('');
        }
    },

    renderTree() {
        const stages = [
            { max: 5000, emoji: '🌱', name: 'Mầm non', next: 5000 },
            { max: 15000, emoji: '🌿', name: 'Cây non', next: 15000 },
            { max: 30000, emoji: '🌳', name: 'Cây xanh', next: 30000 },
            { max: 50000, emoji: '🌲', name: 'Đại thụ', next: 50000 },
            { max: Infinity, emoji: '🏔️', name: 'Rừng xanh', next: 100000 }
        ];
        const stage = stages.find(s => this.communityTotal < s.max) || stages[stages.length - 1];
        const prevMax = stages[stages.indexOf(stage) - 1]?.max || 0;
        const progress = Math.min(100, ((this.communityTotal - prevMax) / (stage.next - prevMax)) * 100);

        document.getElementById('treeVisual').textContent = stage.emoji;
        document.getElementById('treeStage').textContent = stage.name;
        document.getElementById('treeProgress').style.width = progress + '%';
        document.getElementById('treeProgressText').textContent = `${formatNumber(this.communityTotal)} / ${formatNumber(stage.next)} xu đến giai đoạn tiếp theo`;
        document.getElementById('leafCount').textContent = formatNumber(Math.floor(this.communityTotal / 10));
        document.getElementById('donorCount').textContent = formatNumber(234 + Math.floor(this.totalDonated / 50));
    },

    renderAdWatches() {
        document.getElementById('adWatchesLeft').textContent = this.adWatchesRemaining;
        const btn = document.getElementById('watchAdBtn');
        if (this.adWatchesRemaining <= 0) {
            btn.disabled = true;
            btn.textContent = '❌ Đã hết lượt hôm nay';
        } else {
            btn.disabled = false;
            btn.textContent = '🎬 Xem quảng cáo nhận 5 xu';
        }
    },

    donate() {
        const input = document.getElementById('donationAmount');
        const amount = parseInt(input.value);
        if (!amount || amount <= 0) { showToast('Vui lòng nhập số xu hợp lệ!', 'error'); return; }
        if (amount > this.coinBalance) { showToast('Bạn không đủ xu! Số dư: ' + formatNumber(this.coinBalance), 'error'); return; }

        this.coinBalance -= amount;
        this.totalDonated += amount;
        this.communityTotal += amount;
        this.save();
        this.render();
        input.value = '';

        showToast(`🍃 Đã góp ${formatNumber(amount)} xu! Cảm ơn bạn! ❤️`, 'success');

        // Animate tree
        const tree = document.getElementById('treeVisual');
        tree.style.animation = 'none';
        requestAnimationFrame(() => { tree.style.animation = 'heartBeat 0.6s ease'; });
    },

    watchAd() {
        if (this.adWatchesRemaining <= 0) { showToast('Đã hết lượt xem hôm nay!', 'error'); return; }

        const btn = document.getElementById('watchAdBtn');
        btn.disabled = true;
        btn.textContent = '⏳ Đang xem quảng cáo...';

        // Simulate watching ad for 3 seconds
        setTimeout(() => {
            this.adWatchesRemaining--;
            this.adWatchDate = new Date().toDateString();
            this.awardCoins(5, 'Xem quảng cáo');
            this.save();
            this.renderAdWatches();
        }, 3000);
    },

    awardCoins(amount, reason) {
        this.coinBalance += amount;
        this.earningHistory.unshift({ action: reason, coins: amount, time: 'Vừa xong' });
        if (this.earningHistory.length > 20) this.earningHistory.pop();
        this.save();
        this.renderWallet();
        showToast(`🍃 +${amount} xu: ${reason}`, 'success');
    }
};
