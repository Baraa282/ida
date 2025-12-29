class QuranViewer {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 604;
        this.loading = false;
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadPage(this.currentPage);
    }

    setupElements() {
        this.pageContainer = document.getElementById('current-page-container');
        this.svgContainer = document.getElementById('svg-container');
        this.currentPageSpan = document.getElementById('current-page');
        this.totalPagesSpan = document.getElementById('total-pages');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.pageInput = document.getElementById('page-input');
        this.goBtn = document.getElementById('go-btn');
        this.closeInputBtn = document.getElementById('close-input-btn');
        this.pageInputOverlay = document.getElementById('page-input-overlay');
        this.pageIndicator = document.querySelector('.page-indicator');
        this.loadingIndicator = document.getElementById('loading');
        
        this.totalPagesSpan.textContent = this.totalPages;
    }

    setupEventListeners() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.goToPreviousPage());
        this.nextBtn.addEventListener('click', () => this.goToNextPage());
        
        // Go to page
        this.goBtn.addEventListener('click', () => {
            this.goToPage();
            this.hidePageInput();
        });
        
        this.closeInputBtn.addEventListener('click', () => this.hidePageInput());
        
        this.pageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.goToPage();
                this.hidePageInput();
            }
        });

        // Click on page indicator to show input
        this.pageIndicator.addEventListener('click', () => this.showPageInput());

        // Click outside to close input overlay
        this.pageInputOverlay.addEventListener('click', (e) => {
            if (e.target === this.pageInputOverlay) {
                this.hidePageInput();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                if (e.key === 'ArrowLeft') {
                    this.goToPreviousPage();
                } else {
                    this.goToNextPage();
                }
            }
            // Press 'G' to go to page
            if (e.key === 'g' || e.key === 'G') {
                if (!this.pageInputOverlay.classList.contains('show')) {
                    this.showPageInput();
                }
            }
            // Escape to close input
            if (e.key === 'Escape') {
                this.hidePageInput();
            }
        });

        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next page
                this.goToNextPage();
            } else {
                // Swipe right - previous page
                this.goToPreviousPage();
            }
        }
    }

    async loadPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.totalPages || this.loading) {
            return;
        }

        this.loading = true;
        this.showLoading();

        try {
            // Load only the current page
            await this.loadSvgPage(pageNumber, this.svgContainer);

            this.currentPage = pageNumber;
            this.updateUI();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading page:', error);
            this.hideLoading();
            alert('حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.');
        } finally {
            this.loading = false;
        }
    }

    async loadSvgPage(pageNumber, container) {
        const paddedPageNumber = String(pageNumber).padStart(3, '0');
        const svgPath = `svg/${paddedPageNumber}.svg`;

        try {
            const response = await fetch(svgPath);
            if (!response.ok) {
                throw new Error(`Failed to load page ${pageNumber}`);
            }

            const svgText = await response.text();
            container.innerHTML = svgText;

            // Ensure SVG fills the container
            const svg = container.querySelector('svg');
            if (svg) {
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                svg.style.width = '100%';
                svg.style.height = '100%';
                svg.style.display = 'block';
            }
        } catch (error) {
            console.error(`Error loading SVG for page ${pageNumber}:`, error);
            container.innerHTML = `<div style="text-align: center; padding: 50px; color: #999; display: flex; align-items: center; justify-content: center; height: 100%;">
                <p>خطأ في تحميل الصفحة ${pageNumber}</p>
            </div>`;
        }
    }

    goToPreviousPage() {
        if (this.currentPage > 1) {
            this.loadPage(this.currentPage - 1);
        }
    }

    goToNextPage() {
        if (this.currentPage < this.totalPages) {
            this.loadPage(this.currentPage + 1);
        }
    }

    goToPage() {
        const pageNumber = parseInt(this.pageInput.value);
        if (pageNumber >= 1 && pageNumber <= this.totalPages) {
            this.loadPage(pageNumber);
        } else {
            alert(`يرجى إدخال رقم صفحة بين 1 و ${this.totalPages}`);
            this.pageInput.value = this.currentPage;
        }
    }

    showPageInput() {
        this.pageInput.value = this.currentPage;
        this.pageInputOverlay.classList.add('show');
        setTimeout(() => {
            this.pageInput.focus();
            this.pageInput.select();
        }, 100);
    }

    hidePageInput() {
        this.pageInputOverlay.classList.remove('show');
    }

    updateUI() {
        this.currentPageSpan.textContent = this.currentPage;
        this.pageInput.value = this.currentPage;
        
        // Update button states
        this.prevBtn.disabled = this.currentPage <= 1;
        this.nextBtn.disabled = this.currentPage >= this.totalPages;
    }

    showLoading() {
        this.loadingIndicator.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingIndicator.classList.add('hidden');
    }
}

// Initialize the Quran viewer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new QuranViewer();
});
