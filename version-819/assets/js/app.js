(function () {
  'use strict';

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalizeText(value) {
    return (value || '')
      .toString()
      .trim()
      .toLowerCase();
  }

  function initMobileNavigation() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.textContent = isOpen ? '×' : '☰';
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var currentIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(currentIndex + 1);
    }, 5000);
  }

  function initSearchForms() {
    selectAll('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();

        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var currentPath = window.location.pathname;
        var prefix = currentPath.indexOf('/movies/') !== -1 || currentPath.indexOf('/categories/') !== -1 ? '../' : '';
        var target = prefix + 'search.html';

        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }

        window.location.href = target;
      });
    });
  }

  function initFilters() {
    selectAll('[data-filter-root]').forEach(function (root) {
      var searchInput = root.querySelector('[data-filter-search]');
      var regionSelect = root.querySelector('[data-filter-region]');
      var typeSelect = root.querySelector('[data-filter-type]');
      var yearSelect = root.querySelector('[data-filter-year]');
      var sortSelect = root.querySelector('[data-filter-sort]');
      var list = root.querySelector('[data-filter-list]');
      var empty = root.querySelector('[data-filter-empty]');
      var visibleCount = root.querySelector('[data-count-visible]');
      var cards = selectAll('.filter-card', root);

      function applyQueryFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && searchInput) {
          searchInput.value = query;
        }
      }

      function sortCards(visibleCards) {
        if (!list || !sortSelect) {
          return;
        }

        var mode = sortSelect.value;
        var sortedCards = visibleCards.slice().sort(function (a, b) {
          if (mode === 'views-desc') {
            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          }

          if (mode === 'score-desc') {
            return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
          }

          if (mode === 'title-asc') {
            return normalizeText(a.dataset.title).localeCompare(normalizeText(b.dataset.title), 'zh-Hans-CN');
          }

          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });

        sortedCards.forEach(function (card) {
          list.appendChild(card);
        });
      }

      function applyFilters() {
        var query = normalizeText(searchInput && searchInput.value);
        var region = normalizeText(regionSelect && regionSelect.value);
        var type = normalizeText(typeSelect && typeSelect.value);
        var year = normalizeText(yearSelect && yearSelect.value);
        var visibleCards = [];

        cards.forEach(function (card) {
          var cardSearch = normalizeText(card.dataset.search);
          var cardRegion = normalizeText(card.dataset.region);
          var cardType = normalizeText(card.dataset.type);
          var cardYear = normalizeText(card.dataset.year);
          var matches = true;

          if (query && cardSearch.indexOf(query) === -1) {
            matches = false;
          }

          if (region && cardRegion !== region) {
            matches = false;
          }

          if (type && cardType !== type) {
            matches = false;
          }

          if (year && cardYear !== year) {
            matches = false;
          }

          card.hidden = !matches;

          if (matches) {
            visibleCards.push(card);
          }
        });

        sortCards(visibleCards);

        if (visibleCount) {
          visibleCount.textContent = String(visibleCards.length);
        }

        if (empty) {
          empty.hidden = visibleCards.length !== 0;
        }
      }

      [searchInput, regionSelect, typeSelect, yearSelect, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      applyQueryFromUrl();
      applyFilters();
    });
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var startButton = player.querySelector('[data-player-start]');
      var status = player.querySelector('[data-player-status]');
      var hlsInstance = null;

      if (!video || !startButton) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message || '';
        }
      }

      function startPlayback() {
        var source = video.getAttribute('data-m3u8');

        if (!source) {
          setStatus('当前影片没有可用播放源');
          return;
        }

        startButton.classList.add('is-hidden');
        setStatus('正在初始化播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('');
            video.play().catch(function () {
              setStatus('请再次点击播放器开始播放');
            });
          }, { once: true });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }

          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('');
            video.play().catch(function () {
              setStatus('请再次点击播放器开始播放');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('视频加载失败，请刷新页面重试');
            }
          });
          return;
        }

        setStatus('您的浏览器暂不支持 HLS 播放');
      }

      startButton.addEventListener('click', startPlayback);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNavigation();
    initHeroSlider();
    initSearchForms();
    initFilters();
    initPlayers();
  });
}());
