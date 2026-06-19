(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (toggle && mobilePanel) {
    toggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function matchCard(card, keyword) {
    if (!keyword) {
      return true;
    }
    var haystack = [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' ');
    return normalize(haystack).indexOf(keyword) !== -1;
  }

  function bindLocalFilter(form) {
    var input = form.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-filter-list]');

    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    input.addEventListener('input', function () {
      var keyword = normalize(input.value);
      cards.forEach(function (card) {
        card.classList.toggle('is-hidden', !matchCard(card, keyword));
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]')).forEach(bindLocalFilter);

  var searchList = document.querySelector('[data-search-list]');
  var searchInput = document.querySelector('[data-search-page-input]');

  if (searchList && searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    searchInput.value = q;
    var searchCards = Array.prototype.slice.call(searchList.querySelectorAll('.movie-card'));

    function runSearch() {
      var keyword = normalize(searchInput.value);
      searchCards.forEach(function (card) {
        card.classList.toggle('is-hidden', !matchCard(card, keyword));
      });
    }

    searchInput.addEventListener('input', runSearch);
    runSearch();
  }

  function showMessage(player, text) {
    var message = player.querySelector('[data-player-message]');

    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.add('is-visible');
    window.setTimeout(function () {
      message.classList.remove('is-visible');
    }, 2600);
  }

  function bindPlayer(player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-stream');
    var loaded = false;
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function loadStream() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        showMessage(player, '播放暂不可用');
      }
    }

    function playVideo() {
      loadStream();
      player.classList.add('is-ready');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showMessage(player, '点击视频继续播放');
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-ready');
    });

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(bindPlayer);
})();
