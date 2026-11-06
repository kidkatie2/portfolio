// ============================================================
// Kate Chaparro — Portfolio theme + palette picker
// kc-theme holds light/dark. kc-palette holds an optional extra
// palette layered on top (lavender on light, green on dark).
// Runs immediately to avoid a flash of the wrong colors.
// ============================================================

(function() {
  var OPTIONS = [
    { id: 'light',    base: 'light', palette: null,       label: 'Light',    sw: '#fff0e6', ring: '#dd5045' },
    { id: 'dark',     base: 'dark',  palette: null,       label: 'Dark',     sw: '#0e1118', ring: '#dd5045' },
    { id: 'lavender', base: 'light', palette: 'lavender', label: 'Lavender', sw: '#e8e0fb', ring: '#7c4dcc' },
    { id: 'green',    base: 'dark',  palette: 'green',    label: 'Green',    sw: '#0c1410', ring: '#5fe08a' }
  ];
  var root = document.documentElement;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }

  // Load palette styles next to this script (works from / and /dead/).
  var src = document.currentScript && document.currentScript.src;
  if (src) document.write('<link rel="stylesheet" href="' + src.replace(/theme\.js(\?.*)?$/, 'palettes.css') + '">');

  function current() {
    var pal = root.getAttribute('data-palette');
    if (pal) return pal;
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(id) {
    var o = OPTIONS.filter(function(x) { return x.id === id; })[0] || OPTIONS[0];
    root.setAttribute('data-theme', o.base);
    if (o.palette) root.setAttribute('data-palette', o.palette);
    else root.removeAttribute('data-palette');
    return o;
  }

  var stored = get('kc-theme');
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var base = stored || (prefersDark ? 'dark' : 'light');
  var pal = get('kc-palette');
  var match = OPTIONS.filter(function(x) { return x.palette && x.palette === pal && x.base === base; })[0];
  apply(match ? match.id : base);

  function updateButton(btn) {
    var o = OPTIONS.filter(function(x) { return x.id === current(); })[0];
    var icon = btn.querySelector('.icon');
    var label = btn.querySelector('.label');
    if (icon) icon.innerHTML = '<span class="dot" style="background:' + o.ring + '"></span>';
    if (label) label.textContent = o.label.toUpperCase();
    btn.setAttribute('aria-label', 'Color theme: ' + o.label);
  }

  function init() {
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    buttons.forEach(function(btn) {
      var wrap = document.createElement('span');
      wrap.className = 'kc-pal';
      btn.parentNode.insertBefore(wrap, btn);
      wrap.appendChild(btn);
      btn.setAttribute('aria-haspopup', 'menu');
      btn.setAttribute('aria-expanded', 'false');

      var menu = document.createElement('ul');
      menu.className = 'kc-pal-menu';
      menu.setAttribute('role', 'menu');
      menu.hidden = true;
      OPTIONS.forEach(function(o) {
        var li = document.createElement('li');
        li.setAttribute('role', 'none');
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'menuitemradio');
        b.dataset.id = o.id;
        b.innerHTML = '<span class="kc-pal-sw" style="background:' + o.sw + ';box-shadow:inset 0 0 0 3px ' + o.sw + ',inset 0 0 0 7px ' + o.ring + '"></span>' + o.label;
        b.addEventListener('click', function() {
          apply(o.id);
          set('kc-theme', o.base);
          set('kc-palette', o.palette);
          refresh();
          close();
          btn.focus();
        });
        li.appendChild(b);
        menu.appendChild(li);
      });
      wrap.appendChild(menu);

      function open() {
        menu.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        var on = menu.querySelector('[aria-checked="true"]') || menu.querySelector('button');
        on.focus();
      }
      function close() {
        menu.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      }
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        menu.hidden ? open() : close();
      });
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
    });
    refresh();
  }

  function refresh() {
    document.querySelectorAll('[data-theme-toggle]').forEach(updateButton);
    document.querySelectorAll('.kc-pal-menu button').forEach(function(b) {
      b.setAttribute('aria-checked', b.dataset.id === current() ? 'true' : 'false');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
