window.App = window.App || {};

App.dateUtils = (function () {
  function calcDurationLabel(startYear, startMonth, endYear, endMonth, isCurrent) {
    if (!startYear || !startMonth) return '';

    var endY = endYear;
    var endM = endMonth;
    if (isCurrent || !endYear || !endMonth) {
      var now = new Date();
      endY = now.getFullYear();
      endM = now.getMonth() + 1;
    }

    var totalMonths = (endY - startYear) * 12 + (endM - startMonth);
    if (totalMonths < 0) totalMonths = 0;

    var years = Math.floor(totalMonths / 12);
    var months = totalMonths % 12;

    if (years === 0 && months === 0) return '1ヶ月未満';
    if (years === 0) return months + 'ヶ月';
    if (months === 0) return years + '年';
    return years + '年' + months + 'ヶ月';
  }

  function formatYearMonth(year, month) {
    if (!year || !month) return '';
    return year + '年' + month + '月';
  }

  return {
    calcDurationLabel: calcDurationLabel,
    formatYearMonth: formatYearMonth
  };
})();
