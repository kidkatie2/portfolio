/* Footer train + visit-progress favicon. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Pixel Caltrain in the footer ---------- */
  // . empty  D outline/windows  B body  R stripe  W wheel
  var CAR = [
    '.DDDDDDDDDDDDDDDDDDDDDDDDDDDD.',
    '.DBBBBBBBBBBBBBBBBBBBBBBBBBBD.',
    '.DBDDBDDBDDBDDBDDBDDBDDBDDBBD.',
    '.DBBBBBBBBBBBBBBBBBBBBBBBBBBD.',
    '.DBDDBDDBDDBDDBDDBDDBDDBDDBBD.',
    '.DBBBBBBBBBBBBBBBBBBBBBBBBBBD.',
    '.DRRRRRRRRRRRRRRRRRRRRRRRRRRD.',
    '.DBBBBBBBBBBBBBBBBBBBBBBBBBBD.',
    '.DDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '...WW..WW............WW..WW...'
  ];
  var LOCO = [
    '.DDDDDDDDDDDDDDDDDD.......',
    '.DBBBBBBBBBBBBBBBBBDD.....',
    '.DBBBBBBBBBBBBBBBBBBBD....',
    '.DBDDBDDBDDBBBBBBDDDDBD...',
    '.DBDDBDDBDDBBBBBBDDDDBBD..',
    '.DBBBBBBBBBBBBBBBBBBBBBBD.',
    '.DRRRRRRRRRRRRRRRRRRRRRRRD',
    '.DBBBBBBBBBBBBBBBBBBBBBBBD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDD',
    '...WW..WW.........WW..WW..'
  ];
  var CLS = { D: 't-d', B: 't-b', R: 't-r', W: 't-d' };

  function rects(art, x0) {
    var out = '';
    art.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        var c = row[x];
        if (CLS[c]) out += '<rect x="' + (x0 + x) + '" y="' + y + '" width="1" height="1" class="' + CLS[c] + '"/>';
      }
    });
    return out;
  }

  function buildTrain() {
    var footer = document.querySelector('footer');
    if (!footer) return;
    var CARS = 5;
    var w = CAR[0].length * CARS + LOCO[0].length;
    var px = w * 2;
    var svg = '<svg viewBox="0 0 ' + w + ' 10" width="' + px + '" height="20" shape-rendering="crispEdges" aria-hidden="true">';
    for (var i = 0; i < CARS; i++) svg += rects(CAR, CAR[0].length * i);
    svg += rects(LOCO, CAR[0].length * CARS) + '</svg>';
    var lane = document.createElement('div');
    lane.className = 'footer-train';
    lane.innerHTML = '<div class="footer-train-car">' + svg + '</div>';
    footer.insertBefore(lane, footer.firstChild);
    footer.style.borderTop = 'none';

    var css = document.createElement('style');
    css.textContent =
      '.footer-train{position:relative;height:25px;overflow:hidden;border-bottom:1px dashed rgba(127,127,127,.25)}' +
      '.footer-train-car{position:absolute;left:0;bottom:2px;will-change:transform;' +
        'line-height:0;animation:footer-train 26s linear infinite}' +
      '.footer-train svg{display:block}' +
      '@keyframes footer-train{0%{transform:translateX(-' + (px + 10) + 'px)}70%{transform:translateX(calc(100vw + 20px))}100%{transform:translateX(calc(100vw + 20px))}}' +
      '.footer-train .t-b{fill:#c7ccd6}.footer-train .t-d{fill:#3a3d45}.footer-train .t-r{fill:#D10A3C}' +
      ':root[data-theme="dark"] .footer-train .t-d{fill:#5a5f6c}' +
      ':root[data-theme="dark"] .footer-train .t-r{fill:#FF8FA2}' +
      '@media (prefers-reduced-motion: reduce){.footer-train-car{animation:none;transform:translateX(24px)}}';
    document.head.appendChild(css);
  }

  /* ---------- Favicon: an Elapsed ring that fills over a 5-minute visit ---------- */
  var VISIT_MS = 5 * 60 * 1000;

  function startTime() {
    var now = Date.now();
    try {
      var s = parseInt(sessionStorage.getItem('visitStart'), 10);
      if (s && now - s < 6 * 60 * 60 * 1000) return s;
      sessionStorage.setItem('visitStart', String(now));
    } catch (e) {}
    return now;
  }

  function startFavicon() {
    var canvas = document.createElement('canvas');
    if (!canvas.getContext) return;
    canvas.width = canvas.height = 64;
    var ctx = canvas.getContext('2d');
    var link = document.querySelector('link[rel="icon"]');
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.type = 'image/png';
    var start = startTime();

    function draw() {
      var p = Math.min(1, (Date.now() - start) / VISIT_MS);
      ctx.clearRect(0, 0, 64, 64);
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(127,127,127,0.35)';
      ctx.beginPath(); ctx.arc(32, 32, 24, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#dd5045';
      ctx.beginPath(); ctx.arc(32, 32, 24, -Math.PI / 2, -Math.PI / 2 + Math.max(0.02, p) * Math.PI * 2); ctx.stroke();
      link.href = canvas.toDataURL('image/png');
      if (p < 1) setTimeout(draw, 3000);
    }
    draw();
  }

  function init() {
    buildTrain();
    if (!reduce) startFavicon();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
