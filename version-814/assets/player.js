(function () {
  window.initMoviePlayer = function (source) {
    const video = document.getElementById("movie-video");
    const cover = document.getElementById("movie-cover");
    const button = document.getElementById("movie-start");
    let loaded = false;
    let hls = null;

    if (!video || !source) {
      return;
    }

    const load = function () {
      if (loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    };

    const play = async function () {
      load();
      if (cover) {
        cover.classList.add("is-hidden");
      }

      try {
        await video.play();
      } catch (error) {
        video.setAttribute("controls", "controls");
      }
    };

    if (cover) {
      cover.addEventListener("click", play);
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
