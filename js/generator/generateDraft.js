window.App = window.App || {};

App.generateDraft = function (state) {
  var sections = [
    '■職務要約\n' + App.sections.buildSummarySection(state),
    App.sections.buildStrengthsSection(state),
    App.sections.buildWorkHistorySection(state),
    App.sections.buildPcSkillsSection(state),
    App.sections.buildSelfPrSection(state)
  ].filter(function (s) { return s && s.trim(); });

  return sections.join('\n\n');
};
