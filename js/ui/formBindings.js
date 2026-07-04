window.App = window.App || {};

App.formBindings = (function () {
  var elementFromHTML = App.repeatableList.elementFromHTML;
  var escapeHTML = App.repeatableList.escapeHTML;
  var escapeAttr = App.repeatableList.escapeAttr;

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function formatTime(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function updateAutosaveLabel() {
    var el = document.querySelector('[data-autosave-label]');
    if (!el) return;
    var savedAt = App.state.get().meta.lastSavedAt;
    el.textContent = savedAt ? ('自動保存済み ' + formatTime(savedAt)) : '';
  }

  function monthOptionsHTML(selected) {
    var opts = '<option value="">--</option>';
    for (var m = 1; m <= 12; m++) {
      opts += '<option value="' + m + '"' + (selected === m ? ' selected' : '') + '>' + m + '</option>';
    }
    return opts;
  }

  // ---- Step: 基本情報 ----
  function bindProfileStep() {
    var nameInput = document.querySelector('#profile-name');
    var targetJobInput = document.querySelector('#profile-target-job');
    if (!nameInput || !targetJobInput) return;

    var profile = App.state.get().profile;
    nameInput.value = profile.name || '';
    targetJobInput.value = profile.targetJob || '';

    nameInput.addEventListener('input', function () {
      App.state.updateProfile({ name: nameInput.value });
      updateAutosaveLabel();
    });
    targetJobInput.addEventListener('input', function () {
      App.state.updateProfile({ targetJob: targetJobInput.value });
      updateAutosaveLabel();
    });
  }

  // ---- Step: 職歴・経験 ----
  function renderWorkHistoryCard(item) {
    var employmentOptionsHTML = App.templatesData.employmentTypes.map(function (t) {
      return '<option value="' + t + '"' + (item.employmentType === t ? ' selected' : '') + '>' + t + '</option>';
    }).join('');

    var html =
      '<div class="repeat-card" data-id="' + item.id + '">' +
        '<div class="repeat-card-header">' +
          '<strong data-card-title>' + (item.orgName ? escapeHTML(item.orgName) : '新しい職歴') + '</strong>' +
          '<button type="button" class="btn btn-link" data-remove>削除</button>' +
        '</div>' +
        '<div class="field"><label>組織名(会社・団体・学校等)</label>' +
          '<input type="text" data-field="orgName" value="' + escapeAttr(item.orgName || '') + '" placeholder="例: 株式会社〇〇 / 〇〇大学 学生団体"></div>' +
        '<div class="field"><label>雇用形態</label>' +
          '<select data-field="employmentType"><option value="">選択してください</option>' + employmentOptionsHTML + '</select></div>' +
        '<div class="field-row">' +
          '<div class="field"><label>開始年月</label><div class="inline-selects">' +
            '<input type="number" data-field="startYear" value="' + (item.startYear || '') + '" placeholder="年" min="1970" max="2100">年 ' +
            '<select data-field="startMonth">' + monthOptionsHTML(item.startMonth) + '</select>月' +
          '</div></div>' +
          '<div class="field"><label>終了年月</label><div class="inline-selects">' +
            '<input type="number" data-field="endYear" value="' + (item.endYear || '') + '" placeholder="年" min="1970" max="2100"' + (item.isCurrent ? ' disabled' : '') + '>年 ' +
            '<select data-field="endMonth"' + (item.isCurrent ? ' disabled' : '') + '>' + monthOptionsHTML(item.endMonth) + '</select>月' +
          '</div></div>' +
        '</div>' +
        '<div class="field checkbox-field"><label><input type="checkbox" data-field="isCurrent"' + (item.isCurrent ? ' checked' : '') + '> 在籍中</label></div>' +
        '<div class="field"><label>事業内容</label>' +
          '<input type="text" data-field="businessDescription" value="' + escapeAttr(item.businessDescription || '') + '" placeholder="例: Webサービスの企画・開発"></div>' +
        '<div class="field"><label>担当業務(1行に1項目)</label>' +
          '<textarea data-field="dutiesText" placeholder="例:&#10;新規顧客への提案営業&#10;既存顧客のフォローアップ">' + escapeHTML((item.duties || []).join('\n')) + '</textarea></div>' +
        '<div class="field"><label>学んだこと・得られたスキル</label>' +
          '<textarea data-field="learnings" placeholder="例: 課題整理力、粘り強い交渉力">' + escapeHTML(item.learnings || '') + '</textarea></div>' +
      '</div>';

    var node = elementFromHTML(html);

    node.querySelectorAll('[data-field]').forEach(function (fieldEl) {
      var field = fieldEl.getAttribute('data-field');
      var eventName = (fieldEl.tagName === 'SELECT' || fieldEl.type === 'checkbox') ? 'change' : 'input';
      fieldEl.addEventListener(eventName, function () {
        if (field === 'dutiesText') {
          var duties = fieldEl.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
          App.state.workHistory.update(item.id, { duties: duties });
          updateAutosaveLabel();
          return;
        }

        var value;
        if (fieldEl.type === 'checkbox') {
          value = fieldEl.checked;
        } else if (field === 'startYear' || field === 'endYear') {
          value = fieldEl.value ? Number(fieldEl.value) : null;
        } else if (field === 'startMonth' || field === 'endMonth') {
          value = fieldEl.value ? Number(fieldEl.value) : null;
        } else {
          value = fieldEl.value;
        }

        var partial = {};
        partial[field] = value;
        App.state.workHistory.update(item.id, partial);

        if (field === 'isCurrent') {
          var endYearEl = node.querySelector('[data-field="endYear"]');
          var endMonthEl = node.querySelector('[data-field="endMonth"]');
          endYearEl.disabled = value;
          endMonthEl.disabled = value;
        }
        if (field === 'orgName') {
          var title = node.querySelector('[data-card-title]');
          if (title) title.textContent = value || '新しい職歴';
        }
        updateAutosaveLabel();
      });
    });

    node.querySelector('[data-remove]').addEventListener('click', function () {
      if (window.confirm('この職歴を削除します。よろしいですか?')) {
        App.state.workHistory.remove(item.id);
        renderWorkHistoryList();
        updateAutosaveLabel();
      }
    });

    return node;
  }

  function renderWorkHistoryList() {
    var container = document.querySelector('#work-history-list');
    if (!container) return;
    var emptyHint = document.querySelector('#work-history-empty');
    var items = App.state.workHistory.list();
    if (emptyHint) emptyHint.style.display = items.length === 0 ? '' : 'none';
    App.repeatableList.render(container, items, renderWorkHistoryCard);
  }

  function bindWorkHistoryStep() {
    var addBtn = document.querySelector('#work-history-add');
    if (!addBtn) return;
    addBtn.addEventListener('click', function () {
      App.state.workHistory.add({
        orgName: '', employmentType: '', startYear: null, startMonth: null,
        endYear: null, endMonth: null, isCurrent: false,
        businessDescription: '', duties: [], learnings: ''
      });
      renderWorkHistoryList();
      updateAutosaveLabel();
    });
    renderWorkHistoryList();
  }

  // ---- Step: 強み・スキル ----
  function renderStrengthRow(item) {
    var ratingOptionsHTML = App.templatesData.selfRatingOptions.map(function (opt) {
      return '<label class="rating-option"><input type="radio" name="rating-' + item.id + '" value="' + opt.value + '"' +
        (item.selfRating === opt.value ? ' checked' : '') + '> ' + opt.label + '</label>';
    }).join('');

    var html =
      '<div class="strength-row" data-id="' + item.id + '">' +
        '<p class="strength-label">' + escapeHTML(item.label) + '</p>' +
        '<div class="rating-options">' + ratingOptionsHTML + '</div>' +
        '<div class="field episode-field" style="display:' + (item.selfRating === 'good' ? '' : 'none') + '">' +
          '<label>具体的なエピソード</label>' +
          '<textarea data-field="episode" placeholder="例: 新規プロジェクトでチーム間の調整を担当し、意見の対立を解消して期限内に合意形成した">' + escapeHTML(item.episode || '') + '</textarea>' +
        '</div>' +
      '</div>';

    var node = elementFromHTML(html);
    var episodeField = node.querySelector('.episode-field');

    node.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        App.state.updateStrength(item.id, { selfRating: radio.value });
        episodeField.style.display = radio.value === 'good' ? '' : 'none';
        updateAutosaveLabel();
      });
    });

    node.querySelector('[data-field="episode"]').addEventListener('input', function (e) {
      App.state.updateStrength(item.id, { episode: e.target.value });
      updateAutosaveLabel();
    });

    return node;
  }

  function renderStrengthsStep() {
    var container = document.querySelector('#strengths-list');
    if (!container) return;

    var strengths = App.state.get().strengths;
    var categories = [];
    strengths.forEach(function (item) {
      if (categories.indexOf(item.category) === -1) categories.push(item.category);
    });

    container.innerHTML = '';
    categories.forEach(function (category) {
      var section = document.createElement('div');
      section.className = 'strength-category';

      var heading = document.createElement('h3');
      heading.textContent = category;
      section.appendChild(heading);

      strengths
        .filter(function (item) { return item.category === category; })
        .forEach(function (item) { section.appendChild(renderStrengthRow(item)); });

      container.appendChild(section);
    });
  }

  function bindStrengthsStep() {
    renderStrengthsStep();
  }

  // ---- Step: PCスキル ----
  function renderPcSkillCard(item) {
    var isOther = !!item.softwareName && App.templatesData.pcSoftwareCandidates.indexOf(item.softwareName) === -1;
    var candidateOptionsHTML = App.templatesData.pcSoftwareCandidates.map(function (name) {
      return '<option value="' + name + '"' + (item.softwareName === name ? ' selected' : '') + '>' + name + '</option>';
    }).join('');
    var levelOptionsHTML = App.templatesData.pcSkillLevels.map(function (lvl) {
      return '<option value="' + lvl.value + '"' + (item.level === lvl.value ? ' selected' : '') + '>' + lvl.label + '</option>';
    }).join('');

    var html =
      '<div class="repeat-card pc-skill-card" data-id="' + item.id + '">' +
        '<div class="field-row">' +
          '<div class="field"><label>ソフト名</label>' +
            '<select data-field="softwareSelect"><option value="">選択してください</option>' + candidateOptionsHTML +
            '<option value="__other__"' + (isOther ? ' selected' : '') + '>その他(自由入力)</option></select></div>' +
          '<div class="field pc-skill-other-field" style="display:' + (isOther ? '' : 'none') + '">' +
            '<label>ソフト名(自由入力)</label>' +
            '<input type="text" data-field="softwareNameOther" value="' + escapeAttr(isOther ? item.softwareName : '') + '" placeholder="例: Illustrator"></div>' +
          '<div class="field"><label>習熟度</label>' +
            '<select data-field="level"><option value="">選択してください</option>' + levelOptionsHTML + '</select></div>' +
        '</div>' +
        '<button type="button" class="btn btn-link" data-remove>削除</button>' +
      '</div>';

    var node = elementFromHTML(html);
    var softwareSelect = node.querySelector('[data-field="softwareSelect"]');
    var otherField = node.querySelector('.pc-skill-other-field');
    var otherInput = node.querySelector('[data-field="softwareNameOther"]');
    var levelSelect = node.querySelector('[data-field="level"]');

    softwareSelect.addEventListener('change', function () {
      if (softwareSelect.value === '__other__') {
        otherField.style.display = '';
        App.state.pcSkill.update(item.id, { softwareName: otherInput.value });
      } else {
        otherField.style.display = 'none';
        App.state.pcSkill.update(item.id, { softwareName: softwareSelect.value });
      }
      updateAutosaveLabel();
    });

    otherInput.addEventListener('input', function () {
      App.state.pcSkill.update(item.id, { softwareName: otherInput.value });
      updateAutosaveLabel();
    });

    levelSelect.addEventListener('change', function () {
      App.state.pcSkill.update(item.id, { level: levelSelect.value });
      updateAutosaveLabel();
    });

    node.querySelector('[data-remove]').addEventListener('click', function () {
      App.state.pcSkill.remove(item.id);
      renderPcSkillsList();
      updateAutosaveLabel();
    });

    return node;
  }

  function renderPcSkillsList() {
    var container = document.querySelector('#pc-skills-list');
    if (!container) return;
    var emptyHint = document.querySelector('#pc-skills-empty');
    var items = App.state.pcSkill.list();
    if (emptyHint) emptyHint.style.display = items.length === 0 ? '' : 'none';
    App.repeatableList.render(container, items, renderPcSkillCard);
  }

  function bindPcSkillsStep() {
    var addBtn = document.querySelector('#pc-skills-add');
    if (!addBtn) return;
    addBtn.addEventListener('click', function () {
      App.state.pcSkill.add({ softwareName: '', level: '' });
      renderPcSkillsList();
      updateAutosaveLabel();
    });
    renderPcSkillsList();
  }

  // ---- Step: 自己PRのもと ----
  function getSuggestedThemeCandidates() {
    var strengths = App.state.get().strengths.filter(function (s) { return s.selfRating === 'good'; });
    var existingLabels = App.state.get().selfPrThemes.map(function (t) { return t.themeLabel; });
    return strengths.filter(function (s) { return existingLabels.indexOf(s.label) === -1; });
  }

  function renderSelfPrSuggestions() {
    var wrap = document.querySelector('#self-pr-suggestions');
    if (!wrap) return;
    var themes = App.state.get().selfPrThemes;

    if (themes.length >= 3) {
      wrap.innerHTML = '<p class="empty-hint">テーマは最大3つまでです。</p>';
      return;
    }

    var candidates = getSuggestedThemeCandidates();
    if (candidates.length === 0) {
      wrap.innerHTML = '<p class="empty-hint">「強み・スキル」で「できる」を選ぶと、ここに候補が表示されます。</p>';
      return;
    }

    wrap.innerHTML = '<p class="step-desc">候補から選ぶ:</p>';
    candidates.forEach(function (s) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-secondary suggestion-btn';
      btn.textContent = '+ ' + s.label;
      btn.addEventListener('click', function () {
        App.state.selfPrTheme.add({ themeLabel: s.label, action: s.episode || '', result: '', aspiration: '' });
        renderSelfPrStep();
        updateAutosaveLabel();
      });
      wrap.appendChild(btn);
    });
  }

  function renderSelfPrThemeCard(item) {
    var html =
      '<div class="repeat-card" data-id="' + item.id + '">' +
        '<div class="repeat-card-header">' +
          '<strong data-card-title>' + (item.themeLabel ? escapeHTML(item.themeLabel) : '新しいテーマ') + '</strong>' +
          '<button type="button" class="btn btn-link" data-remove>削除</button>' +
        '</div>' +
        '<div class="field"><label>テーマ</label>' +
          '<input type="text" data-field="themeLabel" value="' + escapeAttr(item.themeLabel || '') + '" placeholder="例: 課題解決力"></div>' +
        '<div class="field"><label>具体的行動</label>' +
          '<textarea data-field="action" placeholder="例: 前任からの引き継ぎ資料がない状態で顧客対応フローを整理した">' + escapeHTML(item.action || '') + '</textarea></div>' +
        '<div class="field"><label>数値成果</label>' +
          '<textarea data-field="result" placeholder="例: 対応時間を平均30%短縮した">' + escapeHTML(item.result || '') + '</textarea></div>' +
        '<div class="field"><label>今後の抱負</label>' +
          '<textarea data-field="aspiration" placeholder="例: この経験を活かし、貴学の窓口業務の効率化に貢献したい">' + escapeHTML(item.aspiration || '') + '</textarea></div>' +
      '</div>';

    var node = elementFromHTML(html);

    node.querySelectorAll('[data-field]').forEach(function (fieldEl) {
      fieldEl.addEventListener('input', function () {
        var field = fieldEl.getAttribute('data-field');
        var partial = {};
        partial[field] = fieldEl.value;
        App.state.selfPrTheme.update(item.id, partial);
        if (field === 'themeLabel') {
          var title = node.querySelector('[data-card-title]');
          if (title) title.textContent = fieldEl.value || '新しいテーマ';
        }
        updateAutosaveLabel();
      });
    });

    node.querySelector('[data-remove]').addEventListener('click', function () {
      App.state.selfPrTheme.remove(item.id);
      renderSelfPrStep();
      updateAutosaveLabel();
    });

    return node;
  }

  function renderSelfPrStep() {
    var container = document.querySelector('#self-pr-list');
    if (!container) return;
    var emptyHint = document.querySelector('#self-pr-empty');
    var items = App.state.selfPrTheme.list();
    if (emptyHint) emptyHint.style.display = items.length === 0 ? '' : 'none';
    App.repeatableList.render(container, items, renderSelfPrThemeCard);
    renderSelfPrSuggestions();

    var addBtn = document.querySelector('#self-pr-add-custom');
    if (addBtn) addBtn.style.display = items.length >= 3 ? 'none' : '';
  }

  function bindSelfPrStep() {
    var addBtn = document.querySelector('#self-pr-add-custom');
    if (!addBtn) return;
    addBtn.addEventListener('click', function () {
      App.state.selfPrTheme.add({ themeLabel: '', action: '', result: '', aspiration: '' });
      renderSelfPrStep();
      updateAutosaveLabel();
    });
    App.wizard.onStepChange(function (stepId) {
      if (stepId === 'selfPr') renderSelfPrStep();
    });
    renderSelfPrStep();
  }

  function initAll() {
    bindProfileStep();
    bindWorkHistoryStep();
    bindStrengthsStep();
    bindPcSkillsStep();
    bindSelfPrStep();
    updateAutosaveLabel();
  }

  return {
    initAll: initAll,
    updateAutosaveLabel: updateAutosaveLabel
  };
})();
