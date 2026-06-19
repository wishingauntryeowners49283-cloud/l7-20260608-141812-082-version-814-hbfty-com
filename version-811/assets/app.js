(function () {
    var mobileButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var heroIndex = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle('is-active', itemIndex === heroIndex);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle('is-active', itemIndex === heroIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showHero(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    var globalInput = document.querySelector('[data-global-search]');
    var globalButton = document.querySelector('[data-global-search-button]');
    var resultBox = document.querySelector('[data-search-results]');

    function renderSearch() {
        if (!globalInput || !resultBox || !window.SEARCH_INDEX) {
            return;
        }
        var query = globalInput.value.trim().toLowerCase();
        resultBox.innerHTML = '';
        if (!query) {
            resultBox.classList.remove('is-visible');
            return;
        }
        var matches = window.SEARCH_INDEX.filter(function (item) {
            return item.text.indexOf(query) !== -1;
        }).slice(0, 12);
        matches.forEach(function (item) {
            var link = document.createElement('a');
            var image = document.createElement('img');
            var span = document.createElement('span');
            var strong = document.createElement('strong');
            var small = document.createElement('small');
            link.className = 'search-result-item';
            link.href = item.link;
            image.src = item.cover;
            image.alt = item.title;
            strong.textContent = item.title;
            small.textContent = item.meta;
            span.appendChild(strong);
            span.appendChild(small);
            link.appendChild(image);
            link.appendChild(span);
            resultBox.appendChild(link);
        });
        resultBox.classList.toggle('is-visible', matches.length > 0);
    }

    if (globalInput) {
        globalInput.addEventListener('input', renderSearch);
    }

    if (globalButton) {
        globalButton.addEventListener('click', renderSearch);
    }

    var pageInput = document.querySelector('[data-page-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var activeFilter = 'all';

    function cardText(card) {
        return [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre].join(' ').toLowerCase();
    }

    function applyPageFilter() {
        if (!cards.length) {
            return;
        }
        var query = pageInput ? pageInput.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
            var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
            var target = activeFilter.toLowerCase();
            var matchesFilter = activeFilter === 'all' || cardText(card).indexOf(target) !== -1;
            var shouldShow = matchesQuery && matchesFilter;
            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (pageInput) {
        pageInput.addEventListener('input', applyPageFilter);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.dataset.filter || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            applyPageFilter();
        });
    });
})();
