(function () {
  var root = document.querySelector('[data-search-results]');
  var title = document.querySelector('.search-title');
  var input = document.querySelector('.large-search input[name="q"]');
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var index = window.SITE_INDEX || [];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function card(item) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-poster" href="' + escapeHtml(item.url) + '" aria-label="观看' + escapeHtml(item.title) + '">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="movie-badge">' + escapeHtml(item.type) + '</span>',
      '    <span class="movie-hover">立即观看</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>',
      '    <p>' + escapeHtml(item.line) + '</p>',
      '    <div class="movie-meta-row">',
      '      <span>' + escapeHtml(item.genre) + '</span>',
      '      <span>' + escapeHtml(item.year) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  if (input) {
    input.value = query;
  }

  if (!root) {
    return;
  }

  if (query) {
    var lowerQuery = query.toLowerCase();
    var results = index.filter(function (item) {
      return item.text.toLowerCase().indexOf(lowerQuery) !== -1;
    }).slice(0, 240);

    if (title) {
      title.textContent = '“' + query + '”相关内容';
    }

    root.innerHTML = results.length
      ? results.map(card).join('\n')
      : '<p class="empty-state">暂无匹配内容</p>';
  }
})();
