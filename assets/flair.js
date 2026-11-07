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
    var REAR = LOCO.map(function (row) { return row.split('').reverse().join(''); });
    var w = LOCO[0].length * 2 + CAR[0].length * CARS;
    var px = w * 2;
    var svg = '<svg viewBox="0 0 ' + w + ' 10" width="' + px + '" height="20" shape-rendering="crispEdges" aria-hidden="true">';
    svg += rects(REAR, 0);
    for (var i = 0; i < CARS; i++) svg += rects(CAR, LOCO[0].length + CAR[0].length * i);
    svg += rects(LOCO, LOCO[0].length + CAR[0].length * CARS) + '</svg>';
    var lane = document.createElement('div');
    lane.className = 'footer-train';
    lane.innerHTML = '<div class="footer-train-car" role="img" aria-label="Me, taking the Caltrain into work">' + svg +
      '<span class="footer-train-tip" aria-hidden="true">Me, taking the Caltrain into work 🙂</span></div>';
    footer.insertBefore(lane, footer.firstChild);
    footer.style.borderTop = 'none';

    // Constant speed on any screen width; the 0.7 matches the 70% moving share of the keyframes.
    var SPEED = 65; // px per second
    var car = lane.firstChild;
    var tip = car.querySelector('.footer-train-tip');
    // Center the label over the on-screen part of the train, kept 8px inside the window.
    car.addEventListener('mouseenter', function () {
      var r = car.getBoundingClientRect();
      var w = tip.offsetWidth;
      var vw = document.documentElement.clientWidth;
      var mid = (Math.max(r.left, 0) + Math.min(r.right, vw)) / 2;
      var left = Math.min(Math.max(mid - w / 2, 8), vw - w - 8);
      tip.style.left = (left - r.left) + 'px';
    });
    function setDuration() {
      var distance = window.innerWidth + px + 30;
      car.style.animationDuration = (distance / SPEED / 0.7).toFixed(1) + 's';
    }
    setDuration();
    window.addEventListener('resize', setDuration);

    var css = document.createElement('style');
    css.textContent =
      '.footer-train{position:relative;height:48px;overflow:hidden;border-bottom:1px dashed rgba(127,127,127,.25)}' +
      '.footer-train-car{position:absolute;left:0;bottom:2px;will-change:transform;' +
        'line-height:0;animation:footer-train 26s linear infinite}' +
      '.footer-train svg{display:block}' +
      '.footer-train-car:hover{animation-play-state:paused}' +
      '.footer-train-tip{position:absolute;left:0;bottom:calc(100% + 3px);white-space:nowrap;' +
        "font:500 11px/1 'JetBrains Mono','SF Mono',monospace;letter-spacing:.02em;padding:4px 8px;border-radius:3px;" +
        'background:#101218;color:#fff;opacity:0;pointer-events:none;transition:opacity .15s}' +
      '.footer-train-car:hover .footer-train-tip{opacity:1}' +
      ':root[data-theme="dark"] .footer-train-tip{background:#e8ecf5;color:#0e1118}' +
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

  /* ---------- Click to copy in the contact section ---------- */
  var ICON_COPY = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="5" y="5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M11 2.5H3.5a1 1 0 0 0-1 1V11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }
  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove(); ok ? resolve() : reject();
    });
  }

  function setupCopy() {
    var links = document.querySelectorAll('.contact-row a, .kc-contact-row a');
    if (!links.length) return;
    var css = document.createElement('style');
    css.textContent =
      '.cc-link{position:relative;cursor:copy;width:fit-content;max-width:100%;align-self:flex-start}' +
      '.cc-ico{position:absolute;left:100%;top:50%;transform:translateY(-50%);margin-left:10px;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;opacity:0;transition:opacity .15s;font-size:11px;letter-spacing:.06em;text-transform:uppercase;pointer-events:none}' +
      '.cc-link:hover .cc-ico,.cc-link:focus-visible .cc-ico,.cc-link.is-copied .cc-ico{opacity:1}' +
      '@media (hover:none),(max-width:560px){.cc-ico{left:auto;right:0;top:auto;bottom:100%;transform:none;margin:0 0 6px}.cc-link:hover .cc-ico{opacity:0}.cc-link.is-copied .cc-ico{opacity:1}}' +
      '.cc-done{display:none}.cc-link.is-copied .cc-done{display:inline}';
    document.head.appendChild(css);
    var live = document.createElement('span');
    live.setAttribute('aria-live', 'polite');
    live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
    document.body.appendChild(live);

    links.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var isMail = href.indexOf('mailto:') === 0, isTel = href.indexOf('tel:') === 0;
      var value = isMail ? href.slice(7) : isTel ? a.textContent.trim() : a.href;
      var label = isMail ? 'Email' : isTel ? 'Phone number' : 'Link';
      a.classList.add('cc-link');
      a.removeAttribute('target');
      a.setAttribute('title', 'Copy ' + value);
      var ico = document.createElement('span');
      ico.className = 'cc-ico';
      ico.innerHTML = '<span class="cc-svg">' + ICON_COPY + '</span><span class="cc-done">Copied</span>';
      a.appendChild(ico);
      var timer;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        copyText(value).then(function () {
          a.classList.add('is-copied');
          ico.querySelector('.cc-svg').innerHTML = ICON_CHECK;
          live.textContent = label + ' copied to clipboard';
          clearTimeout(timer);
          timer = setTimeout(function () {
            a.classList.remove('is-copied');
            ico.querySelector('.cc-svg').innerHTML = ICON_COPY;
          }, 1800);
        }, function () { window.location.href = a.href; });
      });
    });
  }

  /* ---------- Pixel cursors (arrow + hand), black and white ---------- */
  function pixelSvg(rows, px) {
    var w = rows[0].length, h = rows.length, r = '';
    rows.forEach(function (row, y) {
      for (var x = 0; x < w; x++) {
        var c = row[x];
        if (c === 'X') r += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="#101218"/>';
        else if (c === 'F') r += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="#fff"/>';
      }
    });
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w * px + '" height="' + h * px +
      '" viewBox="0 0 ' + w + ' ' + h + '" shape-rendering="crispEdges">' + r + '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }
  function setupCursor() {
    var PX = 3;
    var ARROW = ['X.......', 'XX......', 'XFX.....', 'XFFX....', 'XFFFX...', 'XFFFFX..', 'XFFFFFX.', 'XFFXXXXX', 'XFX.....', 'XX......', 'X.......'];
    var HAND = ['..XX....', '.XFFX...', '.XFFX...', '.XFFXXX.', 'XXFFXFFX', 'XFFFFFFX', 'XFFFFFFX', '.XFFFFX.', '.XXXXXX.'];
    var arrow = pixelSvg(ARROW, PX) + ' 0 0, auto';
    var hand = pixelSvg(HAND, PX) + ' ' + Math.round(2.5 * PX) + ' 0, pointer';
    var css = document.createElement('style');
    css.textContent =
      'html, body{cursor:' + arrow + '}' +
      'a, button, [role="button"], [role="menuitemradio"], label, summary, select, .cc-link, [data-theme-toggle]{cursor:' + hand + '!important}' +
      'input, textarea, [contenteditable]{cursor:text}';
    document.head.appendChild(css);
  }

  function init() {
    setupCursor();
    setupCopy();
    buildTrain();
    if (!reduce) startFavicon();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
