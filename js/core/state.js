window.App = window.App || {};

App.state = (function () {
  var SCHEMA_VERSION = 1;
  var current = null;

  function generateId() {
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function seedStrengths() {
    return App.templatesData.strengthCatalog.map(function (item) {
      return {
        id: item.id,
        category: item.category,
        label: item.label,
        selfRating: null,
        episode: ''
      };
    });
  }

  function createDefaultState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      profile: { name: '', targetJob: '' },
      workHistories: [],
      strengths: seedStrengths(),
      pcSkills: [],
      selfPrThemes: [],
      generatedDraft: { templateText: '', userEditedText: '', lastGeneratedAt: '' },
      meta: { lastSavedAt: '' }
    };
  }

  function init() {
    var loaded = App.storage.load();
    current = (loaded && loaded.schemaVersion === SCHEMA_VERSION) ? loaded : createDefaultState();
    return current;
  }

  function get() {
    if (!current) init();
    return current;
  }

  function persist() {
    current.meta.lastSavedAt = new Date().toISOString();
    App.storage.save(current);
  }

  function updateProfile(partial) {
    Object.assign(get().profile, partial);
    persist();
  }

  function makeCollectionOps(collectionKey) {
    function list() {
      return get()[collectionKey];
    }
    function add(entry) {
      var item = Object.assign({ id: generateId() }, entry);
      list().push(item);
      persist();
      return item;
    }
    function update(id, partial) {
      var item = list().find(function (x) { return x.id === id; });
      if (item) {
        Object.assign(item, partial);
        persist();
      }
      return item;
    }
    function remove(id) {
      var s = get();
      s[collectionKey] = list().filter(function (x) { return x.id !== id; });
      persist();
    }
    return { list: list, add: add, update: update, remove: remove };
  }

  var workHistoryOps = makeCollectionOps('workHistories');
  var pcSkillOps = makeCollectionOps('pcSkills');
  var selfPrThemeOps = makeCollectionOps('selfPrThemes');

  function updateStrength(id, partial) {
    var item = get().strengths.find(function (x) { return x.id === id; });
    if (item) {
      Object.assign(item, partial);
      persist();
    }
    return item;
  }

  function setGeneratedDraft(templateText) {
    var s = get();
    s.generatedDraft.templateText = templateText;
    s.generatedDraft.lastGeneratedAt = new Date().toISOString();
    persist();
  }

  function setUserEditedDraft(text) {
    get().generatedDraft.userEditedText = text;
    persist();
  }

  function resetAll() {
    App.storage.clear();
    current = createDefaultState();
    persist();
    return current;
  }

  return {
    init: init,
    get: get,
    updateProfile: updateProfile,
    workHistory: workHistoryOps,
    pcSkill: pcSkillOps,
    selfPrTheme: selfPrThemeOps,
    updateStrength: updateStrength,
    setGeneratedDraft: setGeneratedDraft,
    setUserEditedDraft: setUserEditedDraft,
    resetAll: resetAll
  };
})();
