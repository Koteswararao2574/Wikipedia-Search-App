class WikipediaSearch {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchWrapper = document.getElementById('searchWrapper');
        this.searchIcon = document.getElementById('searchIcon');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.searchResults = document.getElementById('searchResults');
        this.welcomeSection = document.getElementById('welcomeSection');
        
        this.isLoading = false;
        this.currentQuery = '';
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Search input events
        this.searchInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.searchInput.addEventListener('focus', () => this.handleFocus());
        this.searchInput.addEventListener('blur', () => this.handleBlur());
        this.searchInput.addEventListener('input', (e) => this.handleInput(e));
    }

    handleKeyDown(event) {
        if (event.key === 'Enter') {
            const query = this.searchInput.value.trim();
            if (query) {
                this.searchWikipedia(query);
            }
        }
    }

    handleFocus() {
        this.searchWrapper.classList.add('focused');
    }

    handleBlur() {
        this.searchWrapper.classList.remove('focused');
    }

    handleInput(event) {
        const value = event.target.value.trim();
        // Clear results when search is cleared
        if (!value && this.searchResults.children.length > 0) {
            this.clearResults();
        }
    }

    async searchWikipedia(query) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentQuery = query;
        this.showLoading();
        this.hideWelcome();
        
        try {
            const url = `https://apis.ccbp.in/wiki-search?search=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            this.displayResults(data.search_results, query);
        } catch (error) {
            console.error('Search error:', error);
            this.displayError();
        } finally {
            this.hideLoading();
            this.isLoading = false;
        }
    }

    showLoading() {
        this.loadingSpinner.style.display = 'block';
        this.searchResults.innerHTML = this.createLoadingSkeletons();
    }

    hideLoading() {
        this.loadingSpinner.style.display = 'none';
    }

    hideWelcome() {
        this.welcomeSection.classList.add('hidden');
    }

    showWelcome() {
        this.welcomeSection.classList.remove('hidden');
    }

    clearResults() {
        this.searchResults.innerHTML = '';
        this.currentQuery = '';
        this.showWelcome();
    }

    createLoadingSkeletons() {
        let skeletons = '';
        for (let i = 0; i < 5; i++) {
            skeletons += `
                <div class="result-card">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-url"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text" style="width: 80%;"></div>
                    <div class="skeleton skeleton-text" style="width: 60%;"></div>
                </div>
            `;
        }
        return `<div class="results-grid">${skeletons}</div>`;
    }

    displayResults(results, query) {
        if (!results || results.length === 0) {
            this.displayNoResults(query);
            return;
        }

        const resultsHeader = `
            <div class="search-results-header">
                <p class="results-count">
                    Found <strong>${results.length}</strong> results for 
                    "<span class="search-query">${this.escapeHtml(query)}</span>"
                </p>
            </div>
        `;

        const resultsGrid = results.map((result, index) => 
            this.createResultCard(result, index)
        ).join('');

        this.searchResults.innerHTML = resultsHeader + `<div class="results-grid">${resultsGrid}</div>`;
    }

    createResultCard(result, index) {
        const { title, link, description } = result;
        const readingTime = this.estimateReadingTime(description);
        const wordCount = this.getWordCount(description);

        return `
            <article class="result-card" style="animation-delay: ${index * 0.1}s;">
                <a href="${this.escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="result-title">
                    ${this.escapeHtml(title)}
                </a>
                <a href="${this.escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="result-url">
                    ${this.escapeHtml(link)}
                </a>
                <p class="result-description">
                    ${this.escapeHtml(description)}
                </p>
                <div class="result-meta">
                    <span class="reading-time">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        ${readingTime} min read
                    </span>
                    <span class="word-count">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        ${wordCount} words
                    </span>
                </div>
            </article>
        `;
    }

    displayNoResults(query) {
        this.searchResults.innerHTML = `
            <div class="no-results">
                <svg class="no-results-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <h3 class="no-results-title">No results found</h3>
                <p class="no-results-description">
                    We couldn't find any articles matching "<strong>${this.escapeHtml(query)}</strong>". 
                    Try searching with different keywords or check your spelling.
                </p>
            </div>
        `;
    }

    displayError() {
        this.searchResults.innerHTML = `
            <div class="no-results">
                <svg class="no-results-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <h3 class="no-results-title">Something went wrong</h3>
                <p class="no-results-description">
                    Unable to search Wikipedia at the moment. Please check your internet connection and try again.
                </p>
            </div>
        `;
    }

    estimateReadingTime(text) {
        const wordsPerMinute = 200;
        const wordCount = this.getWordCount(text);
        const readingTime = Math.ceil(wordCount / wordsPerMinute);
        return Math.max(1, readingTime);
    }

    getWordCount(text) {
        return text.trim().split(/\s+/).length;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WikipediaSearch();
});

// Add some additional interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        // Focus search input with Ctrl/Cmd + K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
    });
});
