window.App = window.App || {};

App.resultView = (function () {
  function render() {
    var textarea = document.querySelector('#draft-textarea');
    if (!textarea) return;
    var draft = App.state.get().generatedDraft;
    textarea.value = draft.userEditedText || draft.templateText || '';
  }

  function generate() {
    var state = App.state.get();
    var hasExistingEdit = !!(state.generatedDraft.userEditedText && state.generatedDraft.userEditedText.trim());
    if (hasExistingEdit) {
      var ok = window.confirm('これまでに手直しした内容が上書きされます。よろしいですか?');
      if (!ok) return;
    }
    var text = App.generateDraft(state);
    App.state.setGeneratedDraft(text);
    App.state.setUserEditedDraft('');
    render();
    App.formBindings.updateAutosaveLabel();
  }

  function bindEditableTextarea() {
    var textarea = document.querySelector('#draft-textarea');
    if (!textarea) return;
    textarea.addEventListener('input', function () {
      App.state.setUserEditedDraft(textarea.value);
      App.formBindings.updateAutosaveLabel();
    });
  }

  function showCopyFeedback(message) {
    var label = document.querySelector('#copy-feedback');
    if (!label) return;
    label.textContent = message;
    setTimeout(function () { label.textContent = ''; }, 2500);
  }

  function fallbackCopy(textarea) {
    textarea.select();
    try {
      document.execCommand('copy');
      showCopyFeedback('コピーしました');
    } catch (e) {
      showCopyFeedback('コピーに失敗しました。テキストを選択して手動でコピーしてください。');
    }
  }

  function copyToClipboard() {
    var textarea = document.querySelector('#draft-textarea');
    if (!textarea) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textarea.value).then(function () {
        showCopyFeedback('コピーしました');
      }, function () {
        fallbackCopy(textarea);
      });
    } else {
      fallbackCopy(textarea);
    }
  }

  function downloadAsText() {
    var textarea = document.querySelector('#draft-textarea');
    if (!textarea) return;
    var blob = new Blob([textarea.value], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '職務経歴書ドラフト.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function printDraft() {
    var textarea = document.querySelector('#draft-textarea');
    var printView = document.querySelector('#draft-print-view');
    if (printView && textarea) printView.textContent = textarea.value;
    window.print();
  }

  function bindAll() {
    var generateBtn = document.querySelector('#draft-generate');
    if (generateBtn) generateBtn.addEventListener('click', generate);

    var copyBtn = document.querySelector('#draft-copy');
    if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);

    var downloadBtn = document.querySelector('#draft-download');
    if (downloadBtn) downloadBtn.addEventListener('click', downloadAsText);

    var printBtn = document.querySelector('#draft-print');
    if (printBtn) printBtn.addEventListener('click', printDraft);

    bindEditableTextarea();

    App.wizard.onStepChange(function (stepId) {
      if (stepId === 'result') render();
    });
  }

  return { bindAll: bindAll, render: render };
})();
