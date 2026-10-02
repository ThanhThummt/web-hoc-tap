/* ===== ANALYTICS MODULE ===== */
const Analytics = {
    studyData: {
        daily: [2.5, 3.0, 1.5, 4.0, 2.0, 3.5, 2.8],
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        subjects: [
            { name: 'Mạng máy tính', hours: 12, color: '#6C63FF' },
            { name: 'Tiếng Nhật', hours: 8, color: '#FF6B6B' },
            { name: 'Lập trình Web', hours: 15, color: '#4CAF50' },
            { name: 'Cơ sở dữ liệu', hours: 5, color: '#FFB74D' }
        ],
        deadlines: { onTime: 15, late: 5 },
        totalHours: 40,
        avgPerDay: 2.7,
        streak: 12,
        completionRate: 75
    },

    init() {
        this.renderStudyHoursChart();
        this.renderDeadlineStats();
        this.renderSubjectTimeChart();
        this.setupFilters();
    },

    setupFilters() {
        document.querySelectorAll('#section-analytics .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#section-analytics .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const period = btn.dataset.period;
                this.updateForPeriod(period);
            });
        });
    },

    updateForPeriod(period) {
        // Simulate different data for different periods
        const multipliers = { week: 1, month: 4.2, all: 12 };
        const m = multipliers[period] || 1;
        document.getElementById('statTotalHours').textContent = Math.round(this.studyData.totalHours * m);
        document.getElementById('statAvgDay').textContent = (this.studyData.avgPerDay * (period === 'all' ? 0.9 : 1)).toFixed(1);
        this.renderStudyHoursChart(period);
    },

    renderStudyHoursChart(period) {
        const container = document.getElementById('studyHoursChart');
        if (!container) return;

        let data, labels;
        if (period === 'month') {
            data = [18, 22, 15, 20, 25, 19, 21, 17, 23, 20, 16, 22, 18, 24, 20, 19, 21, 23, 17, 22, 25, 18, 20, 19, 23, 21, 17, 24, 20, 22];
            labels = Array.from({ length: 30 }, (_, i) => (i + 1).toString());
        } else {
            data = this.studyData.daily;
            labels = this.studyData.labels;
        }

        const max = Math.max(...data);
        container.innerHTML = `
            <div class="bar-chart">
                ${data.map((v, i) => `
                    <div class="bar" style="height:${(v / max) * 100}%;animation-delay:${i * 0.05}s;">
                        <span class="bar-value">${period === 'month' ? v + '' : v + 'h'}</span>
                        <span class="bar-label">${labels[i]}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // Animate bars
        setTimeout(() => {
            container.querySelectorAll('.bar').forEach(bar => {
                const h = bar.style.height;
                bar.style.height = '0%';
                requestAnimationFrame(() => { bar.style.height = h; });
            });
        }, 50);
    },

    renderDeadlineStats() {
        const container = document.getElementById('deadlineStatsChart');
        if (!container) return;

        const { onTime, late } = this.studyData.deadlines;
        const total = onTime + late;
        const onTimePercent = Math.round((onTime / total) * 100);
        const latePercent = 100 - onTimePercent;

        container.innerHTML = `
            <div class="pie-chart-wrapper">
                <div class="pie-chart" style="background:conic-gradient(var(--accent-green) 0deg ${onTimePercent * 3.6}deg, var(--accent) ${onTimePercent * 3.6}deg 360deg);">
                    <div class="pie-chart-center">${onTimePercent}%</div>
                </div>
                <div class="chart-legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background:var(--accent-green);"></div>
                        <span>Đúng hạn: ${onTime} (${onTimePercent}%)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background:var(--accent);"></div>
                        <span>Trễ hạn: ${late} (${latePercent}%)</span>
                    </div>
                    <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
                        <div style="font-size:.85rem;color:var(--text-secondary);">Tổng: ${total} deadline</div>
                    </div>
                </div>
            </div>
        `;
    },

    renderSubjectTimeChart() {
        const container = document.getElementById('subjectTimeChart');
        if (!container) return;

        const subjects = this.studyData.subjects;
        const total = subjects.reduce((s, x) => s + x.hours, 0);

        // Build conic-gradient
        let gradientParts = [];
        let angle = 0;
        subjects.forEach(s => {
            const deg = (s.hours / total) * 360;
            gradientParts.push(`${s.color} ${angle}deg ${angle + deg}deg`);
            angle += deg;
        });

        container.innerHTML = `
            <div class="pie-chart-wrapper">
                <div class="pie-chart" style="background:conic-gradient(${gradientParts.join(',')});">
                    <div class="pie-chart-center">${total}h</div>
                </div>
                <div class="chart-legend">
                    ${subjects.map(s => {
                        const pct = Math.round((s.hours / total) * 100);
                        return `
                            <div class="legend-item">
                                <div class="legend-color" style="background:${s.color};"></div>
                                <span>${s.name}: ${s.hours}h (${pct}%)</span>
                            </div>`;
                    }).join('')}
                </div>
            </div>
        `;
    }
};
