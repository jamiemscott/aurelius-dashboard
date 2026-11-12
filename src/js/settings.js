/* ─── SITE SETTINGS STORE ──────────────────────────────────────
   Loaded in <head>, before the first paint, so a saved setting
   never flashes the default first.

   Saves the Site settings drawer's choices in one localStorage key
   and mirrors each onto <html> as data-site-<name>, which is all
   the CSS looks at (see "Applied settings" in site-settings.css).
   OutSystems never sets these attributes, so the shared bundle.css
   changes nothing there until it opts in.

   Wire a control with data-setting="<name>". Radios save their
   value; a switch also takes data-checked / data-unchecked, the
   value saved in each state. [data-settings-reset] restores the
   defaults.

   Theme: light, dark or system. data-site-theme-mode holds the
   resolved light or dark (system follows the device). The header
   switch and account menu share .theme-checkbox, which 25 CSS
   rules (and OutSystems) key off, so this keeps it in step rather
   than replacing it.                                             */
(function () {
  var KEY = 'aurelius-settings';
  var LEGACY_THEME = 'aurelius-theme';   // what login.js and splash.js read
  var DEFAULTS = { ava: 'on', pattern: 'on', theme: 'dark' };
  var LABELS = {
    ava:     { on: 'Ava chat button shown', off: 'Ava chat button hidden' },
    pattern: { on: 'Background pattern shown', off: 'Background pattern hidden' },
    theme:   { light: 'Light theme', dark: 'Dark theme', system: 'Theme follows your device' }
  };
  var deviceLight = window.matchMedia('(prefers-color-scheme: light)');

  function copy(o) { var r = {}; for (var k in o) r[k] = o[k]; return r; }

  // Storage can be blocked (private browsing, strict privacy settings);
  // the defaults then apply and the page still looks right.
  function read() {
    var s = copy(DEFAULTS);
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      // A theme chosen on the sign-in page carries over
      if (!saved.theme) saved.theme = localStorage.getItem(LEGACY_THEME) || undefined;
      for (var k in DEFAULTS) if (typeof saved[k] === 'string') s[k] = saved[k];
    } catch (e) { /* keep defaults */ }
    return s;
  }

  function mode(s) {
    if (s.theme === 'system') return deviceLight.matches ? 'light' : 'dark';
    return s.theme === 'light' ? 'light' : 'dark';
  }

  function write(s) {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
      localStorage.setItem(LEGACY_THEME, mode(s));
    } catch (e) { /* not saved */ }
  }

  function apply(s) {
    var html = document.documentElement;
    for (var k in s) html.setAttribute('data-site-' + k, s[k]);
    html.setAttribute('data-site-theme-mode', mode(s));
  }

  var settings = read();
  apply(settings);

  document.addEventListener('DOMContentLoaded', function () {
    var drawer = document.getElementById('site-settings');
    var themeSwitch = document.querySelector('.theme-checkbox');
    var controls = drawer ? drawer.querySelectorAll('[data-setting]') : [];

    function sync() {
      if (themeSwitch) themeSwitch.checked = mode(settings) === 'light';
      Array.prototype.forEach.call(controls, function (el) {
        var v = settings[el.dataset.setting];
        el.checked = el.type === 'radio' ? v === el.value : v === el.dataset.checked;
      });
    }

    function announce(text) {
      var live = document.querySelector('.theme-live');
      if (live) live.textContent = text;
    }

    function set(name, value, quiet) {
      settings[name] = value;
      write(settings);
      apply(settings);
      sync();
      if (!quiet && LABELS[name]) announce(LABELS[name][value]);
      // Hiding the Ava button closes the chat too, or it would be left
      // open with no button to close it from
      if (name === 'ava' && value === 'off' && typeof closeChatbot === 'function') closeChatbot();
    }

    // The header switch and the account menu pick light or dark outright.
    // main.js already announces these, so stay quiet.
    if (themeSwitch) themeSwitch.addEventListener('change', function () {
      set('theme', themeSwitch.checked ? 'light' : 'dark', true);
    });

    // System follows the device as it changes
    deviceLight.addEventListener('change', function () {
      if (settings.theme === 'system') { apply(settings); sync(); }
    });

    Array.prototype.forEach.call(controls, function (el) {
      el.addEventListener('change', function () {
        if (el.type === 'radio') { if (el.checked) set(el.dataset.setting, el.value); }
        else set(el.dataset.setting, el.checked ? el.dataset.checked : el.dataset.unchecked);
      });
    });

    var reset = drawer && drawer.querySelector('[data-settings-reset]');
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
