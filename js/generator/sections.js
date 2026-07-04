window.App = window.App || {};

App.sections = (function () {
  function calcTotalExperienceMonths(workHistories) {
    var total = 0;
    workHistories.forEach(function (w) {
      if (!w.startYear || !w.startMonth) return;
      var endY = w.endYear;
      var endM = w.endMonth;
      if (w.isCurrent || !endY || !endM) {
        var now = new Date();
        endY = now.getFullYear();
        endM = now.getMonth() + 1;
      }
      var months = (endY - w.startYear) * 12 + (endM - w.startMonth);
      if (months > 0) total += months;
    });
    return total;
  }

  function monthsToLabel(totalMonths) {
    var years = Math.floor(totalMonths / 12);
    var months = totalMonths % 12;
    if (years === 0 && months === 0) return '';
    if (years === 0) return months + 'ヶ月';
    if (months === 0) return years + '年';
    return years + '年' + months + 'ヶ月';
  }

  function pickTopStrengthLabel(state) {
    var good = state.strengths.filter(function (s) { return s.selfRating === 'good'; });
    return good.length > 0 ? good[0].label : '';
  }

  function buildSummarySection(state) {
    var count = state.workHistories.length;
    var targetJob = state.profile.targetJob;
    var topStrength = pickTopStrengthLabel(state);
    var targetPhrase = targetJob ? (targetJob + 'として') : '';

    if (count === 0) {
      return '学業・課外活動を通じて' + (topStrength ? topStrength + 'を磨いてまいりました。' : '経験を積んでまいりました。') +
        (targetPhrase ? targetPhrase + '貢献できるよう努めてまいります。' : '');
    }

    var durationLabel = monthsToLabel(calcTotalExperienceMonths(state.workHistories));
    var durationPhrase = durationLabel ? '(通算' + durationLabel + ')' : '';
    return count + '社での実務経験' + durationPhrase + 'を通じて' +
      (topStrength ? topStrength + 'を培ってまいりました。' : '専門性を培ってまいりました。') +
      (targetPhrase ? targetPhrase + '貢献してまいりたいと考えております。' : '');
  }

  function buildStrengthsSection(state) {
    var items = state.strengths.filter(function (s) { return s.selfRating === 'good' && s.episode && s.episode.trim(); });
    if (items.length === 0) return '';
    var bullets = items.map(function (s) { return '・' + s.label + ': ' + s.episode.trim(); });
    return '■貴社で活かせる業務経験・スキル\n' + bullets.join('\n');
  }

  function buildWorkHistorySection(state) {
    if (state.workHistories.length === 0) {
      return '■職務経歴\n実務経験は登録されていません。自己PR欄をご参照ください。';
    }

    var sorted = state.workHistories.slice().sort(function (a, b) {
      var aKey = (a.startYear || 0) * 100 + (a.startMonth || 0);
      var bKey = (b.startYear || 0) * 100 + (b.startMonth || 0);
      return bKey - aKey;
    });

    var blocks = sorted.map(function (w) {
      var duration = App.dateUtils.calcDurationLabel(w.startYear, w.startMonth, w.endYear, w.endMonth, w.isCurrent);
      var periodLabel = App.dateUtils.formatYearMonth(w.startYear, w.startMonth) + '〜' +
        (w.isCurrent ? '現在' : App.dateUtils.formatYearMonth(w.endYear, w.endMonth));
      var headerParts = [w.orgName || '(組織名未入力)'];
      if (duration) headerParts.push('(' + periodLabel + '、' + duration + ')');
      if (w.employmentType) headerParts.push(w.employmentType);

      var lines = [headerParts.join(' ')];
      if (w.businessDescription) lines.push('事業内容: ' + w.businessDescription);
      if (w.duties && w.duties.length > 0) {
        lines.push('【担当業務】');
        w.duties.forEach(function (d) { lines.push('・' + d); });
      }
      if (w.learnings) lines.push('学んだこと・得られたスキル: ' + w.learnings);
      return lines.join('\n');
    });

    return '■職務経歴\n' + blocks.join('\n\n');
  }

  function buildPcSkillsSection(state) {
    if (state.pcSkills.length === 0) return '';
    var levelLabelMap = {};
    App.templatesData.pcSkillLevels.forEach(function (l) { levelLabelMap[l.value] = l.label; });

    var lines = state.pcSkills
      .filter(function (p) { return p.softwareName; })
      .map(function (p) {
        var levelLabel = levelLabelMap[p.level] || '';
        return '・' + p.softwareName + (levelLabel ? ': ' + levelLabel : '');
      });

    return lines.length > 0 ? '■PCスキル\n' + lines.join('\n') : '';
  }

  function buildSelfPrSection(state) {
    if (state.selfPrThemes.length === 0) return '';
    var blocks = state.selfPrThemes.map(function (t, i) {
      var prefix = state.selfPrThemes.length > 1 ? ('案' + (i + 1) + ': ') : '';
      var themeLine = prefix + (t.themeLabel || '(テーマ未入力)');
      var parts = [];
      if (t.action) parts.push(t.action);
      if (t.result) parts.push(t.result);
      if (t.aspiration) parts.push(t.aspiration);
      var paragraph = parts.join('。') + (parts.length > 0 ? '。' : '');
      return themeLine + '\n' + paragraph;
    });
    return '■自己PR\n' + blocks.join('\n\n');
  }

  return {
    buildSummarySection: buildSummarySection,
    buildStrengthsSection: buildStrengthsSection,
    buildWorkHistorySection: buildWorkHistorySection,
    buildPcSkillsSection: buildPcSkillsSection,
    buildSelfPrSection: buildSelfPrSection
  };
})();
