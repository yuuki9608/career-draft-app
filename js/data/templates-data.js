window.App = window.App || {};

App.templatesData = {
  strengthCatalog: [
    { id: 'comm-listen', category: 'コミュニケーション', label: '相手の話を丁寧に聴き、意図を正確にくみ取る' },
    { id: 'comm-explain', category: 'コミュニケーション', label: '自分の考えを分かりやすく伝える' },
    { id: 'comm-consensus', category: 'コミュニケーション', label: '異なる意見の相手とも合意点を見出す' },
    { id: 'solve-priority', category: '課題解決', label: '問題の原因を整理し、優先順位をつけて対応する' },
    { id: 'solve-hypothesis', category: '課題解決', label: '前例のない課題にも仮説を立てて取り組む' },
    { id: 'solve-analyze', category: '課題解決', label: '情報を集めて分析し、判断材料にする' },
    { id: 'mgmt-schedule', category: 'マネジメント', label: '目標やスケジュールを立てて進捗を管理する' },
    { id: 'mgmt-team', category: 'マネジメント', label: 'チームやメンバーの状況に配慮しながら動く' },
    { id: 'mgmt-resource', category: 'マネジメント', label: '限られた時間や資源(人・予算)を効率的に配分する' },
    { id: 'exp-domain', category: '専門知識・実務スキル', label: '特定分野の専門知識を継続的に学び続けている' },
    { id: 'exp-office', category: '専門知識・実務スキル', label: '資料作成やデータ整理などの実務スキルに自信がある' },
    { id: 'exp-system', category: '専門知識・実務スキル', label: 'マニュアル化・仕組み化して再現性を高める' }
  ],

  selfRatingOptions: [
    { value: 'good', label: 'できる' },
    { value: 'ok', label: 'まあまあ' },
    { value: 'weak', label: '苦手' }
  ],

  employmentTypes: ['正社員', '契約社員', '派遣社員', 'パート・アルバイト', '業務委託', 'インターン', 'その他'],

  pcSoftwareCandidates: ['Word', 'Excel', 'PowerPoint', 'Googleスプレッドシート', 'Googleドキュメント', 'Googleスライド', 'Canva', 'Notion', 'Slack'],

  pcSkillLevels: [
    { value: 'basic', label: '使ったことがある' },
    { value: 'practical', label: '実務レベル' },
    { value: 'advanced', label: '得意' }
  ]
};
