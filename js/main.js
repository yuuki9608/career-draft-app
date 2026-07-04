window.App = window.App || {};

function checkStorageAvailable() {
  try {
    var testKey = '__careerDraftApp_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  if (!checkStorageAvailable()) {
    var banner = document.createElement('div');
    banner.className = 'storage-warning-banner';
    banner.textContent = 'このブラウザ・開き方では入力内容を保存できない可能性があります。Google ChromeまたはMicrosoft Edgeでこのファイルを開くか、公開URL(GitHub Pages)からアクセスすることをおすすめします。';
    document.body.insertBefore(banner, document.body.firstChild);
  }

  App.state.init();
  App.wizard.init('[data-progress-bar]');
  App.formBindings.initAll();
  App.resultView.bindAll();

  var hasData = App.state.get().workHistories.length > 0 || App.state.get().profile.name;
  var resumeBtn = document.querySelector('[data-action="resume"]');
  if (resumeBtn) resumeBtn.style.display = hasData ? '' : 'none';

  document.querySelectorAll('[data-action="start"], [data-action="resume"]').forEach(function (btn) {
    btn.addEventListener('click', function () { App.wizard.goToStep('profile'); });
  });

  document.querySelectorAll('[data-action="next"]').forEach(function (btn) {
    btn.addEventListener('click', function () { App.wizard.next(); });
  });
  document.querySelectorAll('[data-action="prev"]').forEach(function (btn) {
    btn.addEventListener('click', function () { App.wizard.prev(); });
  });

  var clearBtn = document.querySelector('[data-action="clear-all"]');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (window.confirm('保存されているすべてのデータを削除します。よろしいですか?')) {
        App.state.resetAll();
        window.location.reload();
      }
    });
  }
});
