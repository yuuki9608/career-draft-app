window.App = window.App || {};

App.wizard = (function () {
  var STEPS = [
    { id: 'intro', label: '', inProgressBar: false },
    { id: 'profile', label: '基本情報', inProgressBar: true },
    { id: 'workHistory', label: '職歴・経験', inProgressBar: true },
    { id: 'strengths', label: '強み・スキル', inProgressBar: true },
    { id: 'pcSkills', label: 'PCスキル', inProgressBar: true },
    { id: 'selfPr', label: '自己PRのもと', inProgressBar: true },
    { id: 'result', label: '', inProgressBar: false }
  ];

  var currentIndex = 0;
  var progressBarEl = null;
  var onStepChangeCallbacks = [];

  function getStepIndexById(id) {
    for (var i = 0; i < STEPS.length; i++) {
      if (STEPS[i].id === id) return i;
    }
    return -1;
  }

  function renderProgressBar() {
    if (!progressBarEl) return;
    var barSteps = STEPS.filter(function (s) { return s.inProgressBar; });
    progressBarEl.innerHTML = '';
    barSteps.forEach(function (step) {
      var idx = getStepIndexById(step.id);
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'progress-step' +
        (idx === currentIndex ? ' is-current' : '') +
        (idx < currentIndex ? ' is-done' : '');
      el.textContent = step.label;
      el.addEventListener('click', function () { goToStep(idx); });
      progressBarEl.appendChild(el);
    });
    progressBarEl.parentElement.style.display = STEPS[currentIndex].inProgressBar ? '' : 'none';
  }

  function showStepSection(index) {
    var step = STEPS[index];
    if (!step) return;
    document.querySelectorAll('.wizard-step').forEach(function (sectionEl) {
      sectionEl.classList.remove('is-active');
    });
    var target = document.querySelector('.wizard-step[data-step-id="' + step.id + '"]');
    if (target) target.classList.add('is-active');
  }

  function goToStep(indexOrId) {
    var index = typeof indexOrId === 'number' ? indexOrId : getStepIndexById(indexOrId);
    if (index < 0 || index >= STEPS.length) return;
    currentIndex = index;
    showStepSection(currentIndex);
    renderProgressBar();
    onStepChangeCallbacks.forEach(function (cb) { cb(STEPS[currentIndex].id, currentIndex); });
    window.scrollTo(0, 0);
  }

  function next() { goToStep(currentIndex + 1); }
  function prev() { goToStep(currentIndex - 1); }
  function onStepChange(cb) { onStepChangeCallbacks.push(cb); }

  function init(progressBarSelector) {
    progressBarEl = document.querySelector(progressBarSelector);
    goToStep(0);
  }

  return {
    init: init,
    next: next,
    prev: prev,
    goToStep: goToStep,
    onStepChange: onStepChange,
    STEPS: STEPS
  };
})();
