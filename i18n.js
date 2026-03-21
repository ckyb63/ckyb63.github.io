(function () {
  const STORAGE_KEY = 'max-portfolio-lang';
  const DEFAULT_LANG = 'en';
  const SUPPORTED_LOCALES = ['en', 'zh-Hant'];

  const localeCache = {};
  let currentMessages = null;

  function getBasePath() {
    const path = window.location.pathname;
    const lastSlash = path.lastIndexOf('/');
    const base = lastSlash === -1 ? '/' : path.substring(0, lastSlash + 1);
    return base;
  }

  function getStoredLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LOCALES.includes(stored)) {
        return stored;
      }
    } catch (e) {
      // ignore
    }
    return detectBrowserLang();
  }

  function detectBrowserLang() {
    const browserLang = (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.userLanguage ||
      ''
    ).toLowerCase();
    return browserLang.startsWith('zh') ? 'zh-Hant' : DEFAULT_LANG;
  }

  function storeLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // ignore
    }
  }

  function getNested(obj, key) {
    if (!obj || !key) return undefined;
    const parts = key.split('.');
    let current = obj;
    for (let i = 0; i < parts.length; i++) {
      if (current && Object.prototype.hasOwnProperty.call(current, parts[i])) {
        current = current[parts[i]];
      } else {
        return undefined;
      }
    }
    return current;
  }

  function applyTranslations(lang, messages) {
    if (!messages) return;
    currentMessages = messages;

    document.documentElement.lang = lang;

    // Meta: description only (title is set via data-i18n on the title element)
    if (typeof messages.metaDescription === 'string') {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', messages.metaDescription);
      }
    }

    // Text content (includes title via data-i18n on <title>)
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      const val = getNested(messages, key);
      if (typeof val === 'string') {
        el.textContent = val;
      }
    });

    // Expand/collapse button state (experience page)
    document.querySelectorAll('.experience-card').forEach(function (card) {
      const btn = card.querySelector('.expand-details-btn');
      if (!btn) return;
      const span = btn.querySelector('span[data-i18n]');
      if (!span) return;
      const key = card.classList.contains('expanded') ? 'aria.collapseDetails' : 'aria.expandDetails';
      const val = getNested(messages, key);
      if (typeof val === 'string') {
        span.textContent = val;
      }
    });

    // Attributes
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      const attrSpec = el.getAttribute('data-i18n-attr');
      if (!attrSpec) return;

      // Support multiple attributes: aria-label:nav.home,title:nav.home
      const parts = attrSpec.split(',').map(function (p) { return p.trim(); }).filter(Boolean);
      parts.forEach(function (pair) {
        const [attr, key] = pair.split(':').map(function (p) { return p.trim(); });
        if (!attr || !key) return;
        const val = getNested(messages, key);
        if (typeof val === 'string') {
          el.setAttribute(attr, val);
        }
      });
    });

    updateLangSwitcherUI(lang);
    updateDownloadLinks(lang);
    document.documentElement.classList.remove('i18n-pending');
  }

  var DRIVE_DOWNLOAD_BASE = 'https://drive.google.com/uc?export=download&id=';

  function updateDownloadLinks(lang) {
    var resumeLink = document.querySelector('a[data-download-resume]');
    var cvLink = document.querySelector('a[data-download-cv]');
    if (resumeLink) {
      var id = (lang === 'zh-Hant' ? (resumeLink.getAttribute('data-id-zh') || resumeLink.getAttribute('data-id-en')) : resumeLink.getAttribute('data-id-en')) || '';
      resumeLink.href = id ? DRIVE_DOWNLOAD_BASE + id : resumeLink.href;
    }
    if (cvLink) {
      var idCV = (lang === 'zh-Hant' ? (cvLink.getAttribute('data-id-zh') || cvLink.getAttribute('data-id-en')) : cvLink.getAttribute('data-id-en')) || '';
      cvLink.href = idCV ? DRIVE_DOWNLOAD_BASE + idCV : cvLink.href;
    }
  }

  function updateLangSwitcherUI(activeLang) {
    const buttons = document.querySelectorAll('.lang-switcher .lang-btn');
    buttons.forEach(function (btn) {
      const lang = btn.getAttribute('data-lang');
      const isActive = lang === activeLang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function loadLocale(lang) {
    if (localeCache[lang]) {
      return Promise.resolve(localeCache[lang]);
    }
    const base = getBasePath();
    const url = base + 'locales/' + lang + '.json';
    return fetch(url, { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Failed to load locale: ' + lang);
        }
        return res.json();
      })
      .then(function (json) {
        localeCache[lang] = json;
        return json;
      });
  }

  function setLanguage(lang) {
    if (!SUPPORTED_LOCALES.includes(lang)) {
      lang = DEFAULT_LANG;
    }
    storeLang(lang);
    document.documentElement.lang = lang;

    return loadLocale(lang)
      .then(function (messages) {
        applyTranslations(lang, messages);
      })
      .catch(function (err) {
        if (lang !== DEFAULT_LANG) {
          return loadLocale(DEFAULT_LANG)
            .then(function (messages) {
              applyTranslations(DEFAULT_LANG, messages);
            })
            .catch(function () {
              document.documentElement.classList.remove('i18n-pending');
            });
        } else {
          document.documentElement.classList.remove('i18n-pending');
        }
      });
  }

  function initLangSwitcher() {
    const buttons = document.querySelectorAll('.lang-switcher .lang-btn');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const lang = btn.getAttribute('data-lang');
        if (!lang) return;
        setLanguage(lang);
      });
    });
  }

  window.__i18nGet = function (key) {
    const val = getNested(currentMessages, key);
    return typeof val === 'string' ? val : null;
  };

  function init() {
    const initialLang = getStoredLang();
    setLanguage(initialLang).then(function () {
      initLangSwitcher();
    }).catch(function () {
      document.documentElement.classList.remove('i18n-pending');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

