(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setMessage(box, text) {
    var message = box.querySelector(".player-message");
    if (!message) {
      return;
    }

    message.textContent = text || "";
    box.classList.toggle("has-message", Boolean(text));
  }

  function setupBox(box) {
    var video = box.querySelector("video");
    var layer = box.querySelector(".play-layer");
    var stream = box.getAttribute("data-stream");
    var hls = null;
    var loaded = false;

    if (!video || !stream) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          setMessage(box, "视频加载失败，请稍后重试");
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    }

    function play() {
      load();
      box.classList.add("is-playing");
      setMessage(box, "");

      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          box.classList.remove("is-playing");
        });
      }
    }

    function toggle() {
      if (video.paused || video.ended) {
        play();
      } else {
        video.pause();
      }
    }

    if (layer) {
      layer.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused || video.ended) {
        play();
      }
    });

    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        box.classList.remove("is-playing");
      }
    });

    video.addEventListener("ended", function () {
      box.classList.remove("is-playing");
    });

    video.addEventListener("error", function () {
      setMessage(box, "视频加载失败，请稍后重试");
    });

    box.addEventListener("keydown", function (event) {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        toggle();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".video-player")).forEach(setupBox);
  });
})();
