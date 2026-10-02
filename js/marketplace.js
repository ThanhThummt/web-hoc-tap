/* ===== MARKETPLACE MODULE ===== */
const Marketplace = {
    activeFilter: 'all',

    listings: [
        { id: 'l1', title: 'Giáo trình Mạng máy tính - Kurose', image: '📘', price: 85000, seller: 'Nguyễn Văn A', rating: 4.5, category: 'sach', description: 'Sách còn mới 90%, có ghi chú bên lề' },
        { id: 'l2', title: 'Laptop Dell Inspiron 15 (cũ)', image: '💻', price: 5500000, seller: 'Trần Thị B', rating: 4.0, category: 'thiet-bi', description: 'Máy hoạt động tốt, pin 3 tiếng' },
        { id: 'l3', title: 'Bộ flashcard JLPT N3', image: '🗂️', price: 45000, seller: 'Lê Minh C', rating: 5.0, category: 'tai-lieu', description: '500 thẻ flashcard Kanji N3 tự làm' },
        { id: 'l4', title: 'Khóa học React JS - Udemy', image: '🎓', price: 150000, seller: 'Phạm Đức D', rating: 4.8, category: 'khoa-hoc', description: 'Tài khoản Udemy còn hạn đến 12/2026' },
        { id: 'l5', title: 'Sách Minna no Nihongo 1-2', image: '📕', price: 120000, seller: 'Hoàng Anh E', rating: 4.2, category: 'sach', description: 'Bộ 2 cuốn + workbook, highlight nhẹ' },
        { id: 'l6', title: 'Máy tính Casio fx-580VN', image: '🔢', price: 350000, seller: 'Vũ Thị F', rating: 4.7, category: 'thiet-bi', description: 'Máy tính còn bảo hành 6 tháng' }
    ],

    sharedDocs: [
        { id: 'd1', title: 'Note Mạng máy tính - Chương 1-5', author: 'Nguyễn A', subject: 'Mạng máy tính', downloads: 234, rating: 4.8 },
        { id: 'd2', title: 'Đề thi cuối kỳ CSDL 2025', author: 'Trần B', subject: 'Cơ sở dữ liệu', downloads: 567, rating: 4.5 },
        { id: 'd3', title: 'Tổng hợp ngữ pháp N3', author: 'Lê C', subject: 'Tiếng Nhật', downloads: 189, rating: 4.9 },
        { id: 'd4', title: 'Cheatsheet JavaScript ES6+', author: 'Phạm D', subject: 'Lập trình Web', downloads: 412, rating: 4.7 },
        { id: 'd5', title: 'Slide bài giảng SQL nâng cao', author: 'Hoàng E', subject: 'Cơ sở dữ liệu', downloads: 156, rating: 4.3 }
    ],

    init() {
        this.renderListings();
        this.renderSharedDocs();
        this.setupFilters();
        this.setupSearch();
    },

    setupFilters() {
        document.querySelectorAll('#marketFilters .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#marketFilters .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilter = btn.dataset.category;
                this.renderListings();
            });
        });
    },

    setupSearch() {
        const search = document.getElementById('marketSearch');
        if (search) {
            search.addEventListener('input', debounce(() => this.renderListings(), 300));
        }
    },

    renderStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
    },

    renderListings() {
        const container = document.getElementById('productGrid');
        if (!container) return;

        const searchQuery = (document.getElementById('marketSearch')?.value || '').toLowerCase();
        let items = this.listings;

        if (this.activeFilter !== 'all') {
            items = items.filter(l => l.category === this.activeFilter);
        }
        if (searchQuery) {
            items = items.filter(l => l.title.toLowerCase().includes(searchQuery) || l.description.toLowerCase().includes(searchQuery));
        }

        container.innerHTML = items.map(l => `
            <div class="card product-card">
                <div class="product-image">${l.image}</div>
                <div class="product-title">${l.title}</div>
                <div class="product-price">${formatPrice(l.price)}</div>
                <div class="product-seller">👤 ${l.seller}</div>
                <div class="rating-stars">${this.renderStars(l.rating)} <span style="color:var(--text-secondary);font-size:.8rem;">${l.rating}</span></div>
                <p style="font-size:.8rem;color:var(--text-secondary);margin-bottom:12px;">${l.description}</p>
                <button class="btn btn-primary btn-sm" style="width:100%;" onclick="Marketplace.messageSeller('${l.seller}')">💬 Nhắn tin</button>
            </div>
        `).join('') || '<p style="color:var(--text-secondary);grid-column:1/-1;text-align:center;padding:40px;">Không tìm thấy sản phẩm nào.</p>';
    },

    renderSharedDocs() {
        const container = document.getElementById('sharedDocsGrid');
        if (!container) return;

        container.innerHTML = this.sharedDocs.map(d => `
            <div class="card shared-doc-card">
                <div class="doc-title">📄 ${d.title}</div>
                <div class="doc-meta">✍️ ${d.author} • 📖 ${d.subject}</div>
                <div class="doc-stats">
                    <span>⬇️ ${d.downloads} lượt tải</span>
                    <span class="rating-stars">${this.renderStars(d.rating)} ${d.rating}</span>
                </div>
                <div class="doc-actions">
                    <button class="btn btn-primary btn-sm" onclick="Marketplace.downloadDoc('${d.id}')">⬇️ Tải về</button>
                    <button class="btn btn-secondary btn-sm" onclick="Marketplace.thankAuthor('${d.author}')">❤️ Cảm ơn</button>
                </div>
            </div>
        `).join('');
    },

    messageSeller(name) {
        showToast(`💬 Đã gửi tin nhắn đến ${name}!`, 'info');
    },

    downloadDoc(id) {
        const doc = this.sharedDocs.find(d => d.id === id);
        if (doc) {
            doc.downloads++;
            this.renderSharedDocs();
            showToast(`⬇️ Đang tải: ${doc.title}`, 'success');
        }
    },

    thankAuthor(name) {
        showToast(`❤️ Đã gửi lời cảm ơn đến ${name}!`, 'success');
    },

    postListing() {
        const title = document.getElementById('listingTitle').value.trim();
        const desc = document.getElementById('listingDesc').value.trim();
        const price = parseInt(document.getElementById('listingPrice').value);
        const category = document.getElementById('listingCategory').value;

        if (!title || !price) { showToast('Vui lòng nhập đủ thông tin!', 'error'); return; }

        const icons = { sach: '📚', 'tai-lieu': '📝', 'thiet-bi': '🔧', 'khoa-hoc': '🎓' };
        this.listings.unshift({
            id: generateId(), title, image: icons[category] || '📦',
            price, seller: 'Bạn', rating: 0, category, description: desc || 'Sản phẩm mới đăng'
        });

        this.renderListings();
        closeModal('modal-post-listing');
        document.getElementById('listingTitle').value = '';
        document.getElementById('listingDesc').value = '';
        document.getElementById('listingPrice').value = '';
        showToast('🏪 Đã đăng tin thành công!', 'success');
    }
};
