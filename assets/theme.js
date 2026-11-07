// ============================================================
// Kate Chaparro — Portfolio theme toggle + color menu
// Mode (light/dark) follows the system; color is random per visit.
// Choices made in the nav last for the visit (sessionStorage). Runs immediately to avoid a flash.
// ============================================================

(function() {
  var COLORS = [
    { id: null,       label: 'Orange',   dot: '#dd5045' },
    { id: 'lavender', label: 'Lavender', dot: '#9b6ee8' },
    { id: 'green',    label: 'Green',    dot: '#2fae62' }
  ];
  var root = document.documentElement;

  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  // Palette styles live next to this script (works from / and /dead/).
  var src = document.currentScript && document.currentScript.src;
  if (src) document.write('<link rel="stylesheet" href="' + src.replace(/theme\.js(\?.*)?$/, 'palettes.css') + '">');

  // Mode follows the system setting. A toggle click overrides it for this visit only.
  var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  function systemMode() { return mq && mq.matches ? 'dark' : 'light'; }
  var sessionMode = sget('kc-theme');
  setMode(sessionMode === 'dark' || sessionMode === 'light' ? sessionMode : systemMode());
  if (mq && mq.addEventListener) mq.addEventListener('change', function() {
    if (!sget('kc-theme')) { setMode(systemMode()); refreshToggles(); }
  });

  // Color is picked at random once per visit, unless the visitor picks one.
  var pal = sget('kc-palette');
  if (pal == null) {
    pal = COLORS[Math.floor(Math.random() * COLORS.length)].id || 'orange';
    sset('kc-palette', pal);
  }
  setPalette(pal);

  function setMode(m) {
    root.setAttribute('data-theme', m);
    set('kc-theme', m); // mirrored for the hosted Anubis prototype
  }

  function setPalette(id) {
    var ok = COLORS.some(function(c) { return c.id && c.id === id; });
    if (ok) root.setAttribute('data-palette', id); else root.removeAttribute('data-palette');
  }
  function currentColor() {
    var id = root.getAttribute('data-palette');
    return COLORS.filter(function(c) { return c.id === id; })[0] || COLORS[0];
  }

  function updateToggle(btn, theme) {
    var icon = btn.querySelector('.icon');
    var label = btn.querySelector('.label');
    if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
    if (label) label.textContent = theme === 'dark' ? 'LIGHT' : 'DARK';
    btn.setAttribute('aria-label', 'Mode: ' + theme + '. Switch to ' + (theme === 'dark' ? 'light' : 'dark'));
  }

  function refreshToggles() {
    var m = root.getAttribute('data-theme');
    document.querySelectorAll('[data-theme-toggle]').forEach(function(b) { updateToggle(b, m); });
  }

  function refreshColor() {
    var c = currentColor();
    document.querySelectorAll('.kc-pal-btn').forEach(function(b) {
      b.querySelector('.dot').style.background = c.dot;
      b.setAttribute('aria-label', 'Color: ' + c.label);
    });
    document.querySelectorAll('.kc-pal-menu button').forEach(function(b) {
      b.setAttribute('aria-checked', b.dataset.label === c.label ? 'true' : 'false');
    });
  }

  function buildColorMenu(toggle) {
    var wrap = document.createElement('span');
    wrap.className = 'kc-pal';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kc-pal-btn';
    btn.setAttribute('aria-haspopup', 'menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="dot"></span>';
    var menu = document.createElement('ul');
    menu.className = 'kc-pal-menu';
    menu.setAttribute('role', 'menu');
    menu.hidden = true;
    COLORS.forEach(function(c) {
      var li = document.createElement('li');
      li.setAttribute('role', 'none');
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'menuitemradio');
      b.dataset.label = c.label;
      b.innerHTML = '<span class="kc-pal-sw" style="background:' + c.dot + '"></span>' + c.label;
      b.addEventListener('click', function() {
        setPalette(c.id);
        sset('kc-palette', c.id || 'orange');
        refreshColor();
        close();
        btn.focus();
      });
      li.appendChild(b);
      menu.appendChild(li);
    });
    wrap.appendChild(btn);
    wrap.appendChild(menu);
    toggle.parentNode.insertBefore(wrap, toggle);

    function open() {
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      (menu.querySelector('[aria-checked="true"]') || menu.querySelector('button')).focus();
    }
    function close() {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', function(e) { e.stopPropagation(); menu.hidden ? open() : close(); });
    document.addEventListener('click', function(e) { if (!wrap.contains(e.target)) close(); });
    wrap.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { close(); btn.focus(); }
      if (!menu.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        var items = [].slice.call(menu.querySelectorAll('button'));
        var i = items.indexOf(document.activeElement);
        items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
      }
    });
  }

  function init() {
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    buttons.forEach(function(btn) {
      updateToggle(btn, root.getAttribute('data-theme'));
      buildColorMenu(btn);
      btn.addEventListener('click', function() {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setMode(next);
        sset('kc-theme', next);
        refreshToggles();
      });
    });
    refreshColor();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
