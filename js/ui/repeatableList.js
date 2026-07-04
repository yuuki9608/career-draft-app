window.App = window.App || {};

App.repeatableList = (function () {
  function render(container, items, renderItemFn) {
    container.innerHTML = '';
    items.forEach(function (item) {
      container.appendChild(renderItemFn(item));
    });
  }

  function elementFromHTML(html) {
    var tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    return tpl.content.firstElementChild;
  }

  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeAttr(str) {
    return escapeHTML(str).replace(/"/g, '&quot;');
  }

  return {
    render: render,
    elementFromHTML: elementFromHTML,
    escapeHTML: escapeHTML,
    escapeAttr: escapeAttr
  };
})();
