(function () {
    window.initMoviePlayer = function (options) {
        var video = options.video;
        var button = options.button;
        var overlay = options.overlay;
        var url = options.url;
        var attached = false;
        var hls = null;

        function attach() {
            if (attached || !video || !url) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function start() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            var playAction = video.play();
            if (playAction && typeof playAction.catch === 'function') {
                playAction.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
}());
