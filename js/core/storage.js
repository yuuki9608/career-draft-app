window.App = window.App || {};

App.storage = (function () {
  var STORAGE_KEY = 'careerDraftApp.v1';

  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('保存データの読み込みに失敗しました。初期状態から始めます。', e);
      return null;
    }
  }

  function save(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('保存に失敗しました。', e);
    }
  }

  function clear() {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return {
    load: load,
    save: save,
    clear: clear
  };
})();
