(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('.movie-player');
    var overlay = shell.querySelector('.player-overlay');
    var streamUrl = video ? video.getAttribute('data-stream') : '';
    var hls = null;
    var ready = false;

    if (!video || !overlay || !streamUrl) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }

      ready = true;
      video.setAttribute('controls', 'controls');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function restoreOverlay() {
      overlay.hidden = false;
      shell.classList.remove('is-playing');
    }

    function start() {
      attach();
      overlay.hidden = true;
      shell.classList.add('is-playing');
      var playAction = video.play();

      if (playAction && typeof playAction.catch === 'function') {
        playAction.catch(function () {
          restoreOverlay();
        });
      }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!ready) {
        start();
      }
    });
    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('error', function () {
      restoreOverlay();
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('.player-shell').forEach(initPlayer);
})();
