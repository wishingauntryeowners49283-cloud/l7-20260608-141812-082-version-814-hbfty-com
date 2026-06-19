(function () {
  "use strict";

  var hlsScriptUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
  var hlsScriptPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsScriptPromise) {
      return hlsScriptPromise;
    }

    hlsScriptPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = hlsScriptUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsScriptPromise;
  }

  function attachStream(video, sourceUrl) {
    if (!video || !sourceUrl) {
      return Promise.resolve();
    }

    if (video.dataset.streamReady === "true") {
      return Promise.resolve();
    }

    video.dataset.streamReady = "true";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return Promise.resolve();
    }

    return loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        video.hlsController = hls;
      } else {
        video.src = sourceUrl;
      }
    }).catch(function () {
      video.src = sourceUrl;
    });
  }

  function preparePlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("[data-video]");
      var trigger = player.querySelector("[data-player-trigger]");
      var sourceUrl = video ? video.getAttribute("data-src") : "";

      function startPlayback() {
        attachStream(video, sourceUrl).then(function () {
          if (trigger) {
            trigger.classList.add("is-hidden");
          }
          if (video) {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
              playPromise.catch(function () {});
            }
          }
        });
      }

      if (trigger) {
        trigger.addEventListener("click", function (event) {
          event.preventDefault();
          startPlayback();
        });
      }

      player.addEventListener("click", function (event) {
        if (event.target.closest("video") || event.target.closest("button")) {
          return;
        }
        startPlayback();
      });
    });
  }

  function prepareHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(activeIndex - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(activeIndex + 1);
        restartTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restartTimer();
      });
    });

    showSlide(0);
    restartTimer();
  }

  function prepareSearch() {
    document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var list = scope.querySelector("[data-search-list]");
      var resultCount = scope.querySelector("[data-result-count]");
      var filters = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

      function getFilterValue(name) {
        var element = filters.find(function (filter) {
          return filter.getAttribute("data-filter") === name;
        });
        return element ? element.value : "all";
      }

      function update() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var selectedRegion = getFilterValue("region");
        var selectedType = getFilterValue("type");
        var selectedYear = getFilterValue("year");
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-title") || "").toLowerCase();
          var region = card.getAttribute("data-region") || "";
          var type = card.getAttribute("data-type") || "";
          var year = card.getAttribute("data-year") || "";
          var matches = true;

          if (query && text.indexOf(query) === -1) {
            matches = false;
          }

          if (selectedRegion !== "all" && region !== selectedRegion) {
            matches = false;
          }

          if (selectedType !== "all" && type !== selectedType) {
            matches = false;
          }

          if (selectedYear !== "all" && year !== selectedYear) {
            matches = false;
          }

          card.hidden = !matches;
          if (matches) {
            visible += 1;
          }
        });

        if (resultCount) {
          resultCount.textContent = visible ? "当前显示 " + visible + " 部影片" : "没有找到匹配影片";
        }
      }

      if (input) {
        input.addEventListener("input", update);
      }

      filters.forEach(function (filter) {
        filter.addEventListener("change", update);
      });

      update();
    });
  }

  function prepareMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
    });
  }

  function prepareImages() {
    document.querySelectorAll("img[data-cover]").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    prepareMenu();
    prepareHero();
    prepareSearch();
    preparePlayers();
    prepareImages();
  });
})();
