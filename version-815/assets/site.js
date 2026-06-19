(function () {
    var mobileButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            mobileButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-chip]'));
        var items = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));

        function applyFilter(value) {
            var keyword = String(value || '').trim().toLowerCase();
            items.forEach(function (item) {
                var haystack = ((item.getAttribute('data-title') || '') + ' ' + (item.getAttribute('data-meta') || '')).toLowerCase();
                var visible = !keyword || keyword === '全部' || haystack.indexOf(keyword) !== -1;
                item.classList.toggle('is-filtered-out', !visible);
            });
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get('q') || '';
            if (initial) {
                input.value = initial;
                applyFilter(initial);
            }
            input.addEventListener('input', function () {
                chips.forEach(function (chip) {
                    chip.classList.remove('is-active');
                });
                applyFilter(input.value);
            });
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (other) {
                    other.classList.remove('is-active');
                });
                chip.classList.add('is-active');
                var value = chip.getAttribute('data-filter-chip') || '';
                if (input) {
                    input.value = value === '全部' ? '' : value;
                }
                applyFilter(value);
            });
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-player-start]');
        var stream = player.getAttribute('data-stream');
        var hls = null;
        var attached = false;
        var pendingPlay = false;

        function playVideo() {
            if (!video) {
                return;
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        function attachStream() {
            if (!video || !stream || attached) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (pendingPlay) {
                            playVideo();
                        }
                    });
                }
            } else {
                video.src = stream;
                video.addEventListener('loadedmetadata', function () {
                    if (pendingPlay) {
                        playVideo();
                    }
                }, { once: true });
            }
            video.setAttribute('controls', 'controls');
        }

        function requestPlay() {
            if (!video) {
                return;
            }
            pendingPlay = true;
            attachStream();
            if (button) {
                button.classList.add('is-hidden');
            }
            playVideo();
        }

        if (button) {
            button.addEventListener('click', requestPlay);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    requestPlay();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
