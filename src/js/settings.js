/* ─── SITE SETTINGS STORE ──────────────────────────────────────
   Loaded in <head>, before the first paint, so a saved setting
   never flashes the default first.

   Saves the Site settings drawer's choices in one localStorage key
   and mirrors each onto <html> as data-site-<name>, which is all
   the CSS looks at (see "Applied settings" in site-settings.css).
   OutSystems never sets these attributes, so the shared bundle.css
   changes nothing there until it opts in.

   Wire a control with data-setting="<name>". A switch also takes
   data-checked / data-unchecked: the value saved in each state.
   A [data-settings-reset] button restores the defaults.           */
(function () {
  var KEY = 'aurelius-settings';
  var DEFAULTS = { ava: 'on', pattern: 'on' };
  var LABELS = {
    ava:     { on: 'Ava chat button shown', off: 'Ava chat button hidden' },
    pattern: { on: 'Background pattern shown', off: 'Background pattern hidden' }
  };

  function copy(o) { var r = {}; for (var k in o) r[k] = o[k]; return r; }

  // Storage can be blocked (private browsing, strict privacy settings);
  // the defaults then apply and the page still looks right.
  function read() {
    var s = copy(DEFAULTS);
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      for (var k in DEFAULTS) if (typeof saved[k] === 'string') s[k] = saved[k];
    } catch (e) { /* keep defaults */ }
    return s;
  }

  function write(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* not saved */ }
  }

  function apply(s) {
    var html = document.documentElement;
    for (var k in s) html.setAttribute('data-site-' + k, s[k]);
  }

  var settings = read();
  apply(settings);

  document.addEventListener('DOMContentLoaded', function () {
    var drawer = document.getElementById('site-settings');
    if (!drawer) return;
    var controls = drawer.querySelectorAll('[data-setting]');

    function sync() {
      controls.forEach(function (el) {
        if (el.type === 'checkbox') el.checked = settings[el.dataset.setting] === el.dataset.checked;
      });
    }

    function announce(text) {
      var live = document.querySelector('.theme-live');
      if (live) live.textContent = text;
    }

    function set(name, value) {
      settings[name] = value;
      write(settings);
      apply(settings);
      if (LABELS[name]) announce(LABELS[name][value]);
      // Hiding the Ava button closes the chat too, or it would be left
      // open with no button to close it from
      if (name === 'ava' && value === 'off' && typeof closeChatbot === 'function') closeChatbot();
    }

    controls.forEach(function (el) {
      el.addEventListener('change', function () {
        if (el.type === 'checkbox') set(el.dataset.setting, el.checked ? el.dataset.checked : el.dataset.unchecked);
      });
    });

    var reset = drawer.querySelector('[data-settings-reset]');
    if (reset) reset.addEventListener('click', function () {
      settings = copy(DEFAULTS);
      write(settings);
      apply(settings);
      sync();
      announce('Settings reset to defaults');
    });

    sync();
  });
})();
