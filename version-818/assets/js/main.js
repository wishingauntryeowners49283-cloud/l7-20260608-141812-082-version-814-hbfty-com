(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startHero() {
      if (timer || slides.length < 2) {
        return;
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        showSlide(index);
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
        startHero();
      });
    });

    startHero();

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var globalSearch = document.getElementById("globalSearch");

    if (globalSearch && query) {
      globalSearch.value = query;
    }

    Array.prototype.slice.call(document.querySelectorAll(".local-filter")).forEach(function (input) {
      var section = input.closest(".content-section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card, .ranking-card"));
      var count = section.querySelector(".filter-count strong");

      function filterCards() {
        var value = input.value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var matched = !value || haystack.indexOf(value) !== -1;
          card.classList.toggle("hidden-card", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      input.addEventListener("input", filterCards);
      filterCards();
    });
  });
})();
