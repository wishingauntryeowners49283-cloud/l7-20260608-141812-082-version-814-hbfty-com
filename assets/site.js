const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

ready(() => {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;

    const show = (nextIndex) => {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    prev?.addEventListener("click", () => show(index - 1));
    next?.addEventListener("click", () => show(index + 1));

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.heroDot || 0));
      });
    });

    window.setInterval(() => show(index + 1), 5000);
  }

  const localSearch = document.querySelector("[data-local-search]");
  const filterRow = document.querySelector("[data-filter-row]");
  const cards = Array.from(document.querySelectorAll("[data-card]"));
  const empty = document.querySelector("[data-empty-state]");
  const url = new URL(window.location.href);
  let activeFilter = "全部";

  const applyFilters = () => {
    const query = (localSearch?.value || "").trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const haystack = (card.dataset.search || card.textContent || "").toLowerCase();
      const filterText = activeFilter.toLowerCase();
      const matchQuery = !query || haystack.includes(query);
      const matchFilter = activeFilter === "全部" || haystack.includes(filterText);
      const showCard = matchQuery && matchFilter;

      card.style.display = showCard ? "" : "none";

      if (showCard) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  };

  if (localSearch) {
    const initialQuery = url.searchParams.get("q") || "";
    localSearch.value = initialQuery;
    localSearch.addEventListener("input", applyFilters);
  }

  if (filterRow) {
    filterRow.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");

      if (!button) {
        return;
      }

      activeFilter = button.dataset.filter || "全部";

      filterRow.querySelectorAll("[data-filter]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

      applyFilters();
    });
  }

  if (localSearch || filterRow) {
    applyFilters();
  }
});
