/* Shared helpers for iOS 9 Safari — ES5-friendly */
(function (global) {
  'use strict';

  var STORAGE_PREFIX = 'ipad_games_v1_';

  function $(id) {
    return document.getElementById(id);
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(arr) {
    var a = arr.slice();
    var i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function pick(arr) {
    return arr[randomInt(0, arr.length - 1)];
  }

  function sample(arr, n) {
    return shuffle(arr).slice(0, n);
  }

  function getProgress(gameId) {
    try {
      var raw = localStorage.getItem(STORAGE_PREFIX + gameId);
      if (!raw) return { maxLevel: 1 };
      var data = JSON.parse(raw);
      if (!data || typeof data.maxLevel !== 'number') return { maxLevel: 1 };
      return data;
    } catch (e) {
      return { maxLevel: 1 };
    }
  }

  function setProgress(gameId, maxLevel) {
    try {
      var cur = getProgress(gameId);
      if (maxLevel > cur.maxLevel) {
        localStorage.setItem(STORAGE_PREFIX + gameId, JSON.stringify({ maxLevel: maxLevel }));
      }
    } catch (e) {}
  }

  function resetAllProgress() {
    try {
      var keys = [];
      var i;
      for (i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(STORAGE_PREFIX) === 0) keys.push(k);
      }
      for (i = 0; i < keys.length; i++) localStorage.removeItem(keys[i]);
    } catch (e) {}
  }

  var feedbackTimer = null;

  function showFeedback(text, ok) {
    var el = $('feedback');
    if (!el) {
      el = document.createElement('div');
      el.id = 'feedback';
      el.className = 'feedback';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.className = 'feedback is-show' + (ok ? '' : ' is-bad');
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(function () {
      el.className = 'feedback';
    }, 1100);
  }

  function showWinOverlay(opts) {
    var overlay = $('win-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'win-overlay';
      overlay.className = 'overlay';
      overlay.innerHTML =
        '<div class="overlay-card">' +
        '<h2 id="win-title">Уровень пройден!</h2>' +
        '<p id="win-text">Отличная работа!</p>' +
        '<div class="overlay-actions">' +
        '<button type="button" class="btn btn-secondary" id="win-next">Следующий уровень</button>' +
        '<button type="button" class="btn" id="win-again">Ещё раз</button>' +
        '<button type="button" class="btn btn-home" id="win-home"><span class="home-ico">🏠</span>Домой</button>' +
        '</div></div>';
      document.body.appendChild(overlay);
    }
    var title = $('win-title');
    var text = $('win-text');
    if (title) title.textContent = opts.title || 'Уровень пройден!';
    if (text) text.textContent = opts.text || 'Отличная работа!';
    overlay.className = 'overlay is-open';

    var nextBtn = $('win-next');
    if (nextBtn) {
      if (opts.onNext) {
        nextBtn.style.display = 'inline-block';
        nextBtn.onclick = function () {
          overlay.className = 'overlay';
          opts.onNext();
        };
      } else {
        nextBtn.style.display = 'none';
        nextBtn.onclick = null;
      }
    }

    var again = $('win-again');
    if (again) {
      again.onclick = function () {
        overlay.className = 'overlay';
        if (opts.onAgain) opts.onAgain();
      };
    }

    var home = $('win-home');
    if (home) {
      home.onclick = function () {
        navigateInApp(siteRootPrefix() + 'index.html');
      };
    }
  }

  function hideWinOverlay() {
    var overlay = $('win-overlay');
    if (overlay) overlay.className = 'overlay';
  }

  /**
   * levelController: renders level buttons, tracks streak, unlocks next level.
   * opts: { gameId, maxLevels, needed, onLevelChange, containerId }
   */
  function createLevelController(opts) {
    var gameId = opts.gameId;
    var maxLevels = opts.maxLevels || 3;
    var needed = opts.needed || 5;
    var level = 1;
    var streak = 0;
    var progress = getProgress(gameId);

    function renderBar() {
      var bar = $(opts.containerId || 'level-bar');
      if (!bar) return;
      bar.innerHTML = '';
      var i;
      for (i = 1; i <= maxLevels; i++) {
        (function (lvl) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'level-btn';
          btn.textContent = (opts.levelLabels && opts.levelLabels[lvl - 1]) || String(lvl);
          if (lvl === level) btn.className += ' is-active';
          if (lvl > progress.maxLevel) btn.className += ' is-locked';
          btn.onclick = function () {
            if (lvl > progress.maxLevel) {
              showFeedback('Сначала пройди уровень ' + progress.maxLevel, false);
              return;
            }
            level = lvl;
            streak = 0;
            renderBar();
            renderPills();
            if (opts.onLevelChange) opts.onLevelChange(level);
          };
          bar.appendChild(btn);
        })(i);
      }
    }

    function renderPills() {
      var wrap = $('progress-pills');
      if (!wrap) return;
      wrap.innerHTML = '';
      var i;
      for (i = 0; i < needed; i++) {
        var p = document.createElement('span');
        p.className = 'pill' + (i < streak ? ' is-done' : '');
        wrap.appendChild(p);
      }
    }

    function goToLevel(lvl) {
      level = lvl;
      streak = 0;
      renderBar();
      renderPills();
      if (opts.onLevelChange) opts.onLevelChange(level);
    }

    function success() {
      streak += 1;
      renderPills();
      showFeedback(pick(['Молодец!', 'Верно!', 'Супер!', 'Отлично!']), true);
      if (streak >= needed) {
        var clearedLevel = level;
        var nextUnlock = Math.min(clearedLevel + 1, maxLevels);
        setProgress(gameId, nextUnlock);
        progress = getProgress(gameId);
        streak = 0;
        renderPills();
        renderBar();
        var hasNext = clearedLevel < maxLevels;
        showWinOverlay({
          title: 'Уровень ' + clearedLevel + ' пройден!',
          text: hasNext ? 'Можно перейти к следующему уровню.' : 'Ты прошёл все уровни!',
          onAgain: function () {
            goToLevel(clearedLevel);
          },
          onNext: hasNext ? function () {
            goToLevel(clearedLevel + 1);
          } : null
        });
        return true;
      }
      return false;
    }

    function fail(msg) {
      streak = 0;
      renderPills();
      showFeedback(msg || 'Попробуй ещё', false);
    }

    function getLevel() {
      return level;
    }

    function getStreak() {
      return streak;
    }

    renderBar();
    renderPills();

    return {
      getLevel: getLevel,
      getStreak: getStreak,
      success: success,
      fail: fail,
      renderBar: renderBar,
      renderPills: renderPills
    };
  }

  function onTap(el, handler) {
    if (!el) return;
    var locked = false;
    function run(e) {
      if (locked) return;
      locked = true;
      setTimeout(function () { locked = false; }, 280);
      if (e && e.preventDefault) e.preventDefault();
      handler(e);
    }
    el.addEventListener('click', run, false);
    el.addEventListener('touchend', function (e) {
      run(e);
    }, false);
  }

  function siteRootPrefix() {
    var scripts = document.getElementsByTagName('script');
    var i;
    var src;
    for (i = 0; i < scripts.length; i++) {
      src = scripts[i].getAttribute('src') || '';
      if (src.indexOf('common.js') !== -1) {
        if (src.indexOf('../../') === 0) return '../../';
        if (src.indexOf('../') === 0) return '../';
        return '';
      }
    }
    if ((window.location.pathname || '').indexOf('/game/') !== -1) return '../../';
    return '';
  }

  /**
   * reload(true) на iOS/AppCache бесполезен — отдаёт ту же закэшированную страницу.
   * Уходим на fresh.html (её нет в CACHE) → оттуда на index.html?r=… с сети.
   */
  function forceAppReload() {
    var root = siteRootPrefix();
    var url = root + 'fresh.html?auto=1&r=' + Date.now();
    try {
      window.location.replace(url);
    } catch (e) {
      window.location.href = url;
    }
  }

  /**
   * AppCache сам качает обновление, но без swapCache+reload остаётся старая версия.
   * На iOS «Домой» это отдельный кэш от Safari.
   */
  function setupAppCacheAutoUpdate() {
    var cache = window.applicationCache;
    if (!cache) return;

    var flag = 'kids_appcache_swapped';
    function swapAndReload() {
      try {
        if (cache.status !== cache.UPDATEREADY) return;
        if (window.sessionStorage && sessionStorage.getItem(flag) === '1') return;
        cache.swapCache();
        if (window.sessionStorage) sessionStorage.setItem(flag, '1');
        showFeedback('Обновлено!', true);
        setTimeout(function () {
          forceAppReload();
        }, 300);
      } catch (e2) {}
    }

    cache.addEventListener('updateready', swapAndReload, false);

    try {
      if (cache.status === cache.UPDATEREADY) {
        swapAndReload();
      } else if (cache.status === cache.IDLE || cache.status === cache.UNCACHED) {
        if (window.sessionStorage) sessionStorage.removeItem(flag);
      }
    } catch (e3) {}

    try {
      if (navigator.onLine !== false && typeof cache.update === 'function') {
        cache.update();
      }
    } catch (e4) {}

    window.addEventListener(
      'online',
      function () {
        try {
          cache.update();
        } catch (e5) {}
      },
      false
    );
  }

  function bindReloadButton() {
    var btn = document.getElementById('btn-reload');
    if (!btn) return;
    function go(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
      showFeedback('Обновляю…', true);
      setTimeout(forceAppReload, 150);
    }
    btn.onclick = go;
    btn.ontouchend = go;
  }

  function bindHomeLongPressReset() {
    var title = document.querySelector('.home-title');
    if (!title) return;
    var timer = null;
    function start() {
      timer = setTimeout(function () {
        if (window.confirm('Сбросить прогресс всех игр?')) {
          resetAllProgress();
          showFeedback('Прогресс сброшен', true);
        }
      }, 2000);
    }
    function cancel() {
      if (timer) clearTimeout(timer);
      timer = null;
    }
    title.addEventListener('touchstart', start, false);
    title.addEventListener('touchend', cancel, false);
    title.addEventListener('touchcancel', cancel, false);
    title.addEventListener('mousedown', start, false);
    title.addEventListener('mouseup', cancel, false);
    title.addEventListener('mouseleave', cancel, false);
  }

  /** Кнопка с крупным эмодзи (iOS 9) */
  function emojiButton(emoji) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-choice is-emoji';
    btn.textContent = emoji;
    return btn;
  }

  function emojiHtml(emoji, extraClass) {
    return '<span class="emo' + (extraClass ? ' ' + extraClass : '') + '">' + emoji + '</span>';
  }

  global.Kids = {
    $: $,
    randomInt: randomInt,
    shuffle: shuffle,
    pick: pick,
    sample: sample,
    getProgress: getProgress,
    setProgress: setProgress,
    resetAllProgress: resetAllProgress,
    showFeedback: showFeedback,
    showWinOverlay: showWinOverlay,
    hideWinOverlay: hideWinOverlay,
    createLevelController: createLevelController,
    onTap: onTap,
    bindHomeLongPressReset: bindHomeLongPressReset,
    bindReloadButton: bindReloadButton,
    forceAppReload: forceAppReload,
    emojiButton: emojiButton,
    emojiHtml: emojiHtml
  };

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, false);
    } else {
      fn();
    }
  }

  function navigateInApp(url) {
    try {
      window.location.assign(url);
    } catch (e) {
      window.location.href = url;
    }
  }

  function resolveUrl(href) {
    var a = document.createElement('a');
    a.href = href;
    return a.href;
  }

  function isInternalHref(href) {
    if (!href) return false;
    if (href.charAt(0) === '#') return false;
    if (/^(javascript:|mailto:|tel:)/i.test(href)) return false;
    if (/^https?:\/\//i.test(href)) {
      return href.indexOf(location.protocol + '//' + location.host) === 0;
    }
    return true;
  }

  /**
   * iOS «На экран Домой»: любой <a href> открывает Safari.
   * Снимаем href и ходим через location — иначе preventDefault не спасает.
   */
  function keepInAppNav() {
    var nodes = document.getElementsByTagName('a');
    /* копируем в массив: removeAttribute меняет live NodeList поведение */
    var list = [];
    var i;
    for (i = 0; i < nodes.length; i++) list.push(nodes[i]);

    for (i = 0; i < list.length; i++) {
      (function (a) {
        if (a.getAttribute('data-inapp') === '1') return;
        var hrefAttr = a.getAttribute('href');
        if (!isInternalHref(hrefAttr)) return;
        var target = a.getAttribute('target');
        if (target && target !== '_self') return;

        var url = resolveUrl(hrefAttr);
        a.setAttribute('data-inapp', '1');
        a.setAttribute('data-href', hrefAttr);
        a.removeAttribute('href');
        a.onclick = function (e) {
          if (e && e.preventDefault) e.preventDefault();
          if (e && e.stopPropagation) e.stopPropagation();
          navigateInApp(url);
          return false;
        };
      })(list[i]);
    }

    var withData = document.querySelectorAll('[data-href]');
    for (i = 0; i < withData.length; i++) {
      (function (el) {
        if (el.getAttribute('data-inapp') === '1') return;
        var hrefAttr = el.getAttribute('data-href');
        if (!hrefAttr) return;
        var url = resolveUrl(hrefAttr);
        el.setAttribute('data-inapp', '1');
        el.onclick = function (e) {
          if (e && e.preventDefault) e.preventDefault();
          if (e && e.stopPropagation) e.stopPropagation();
          navigateInApp(url);
          return false;
        };
      })(withData[i]);
    }
  }

  /* Страховка: если какой-то <a href> остался — перехватываем в capture */
  document.addEventListener(
    'click',
    function (e) {
      var el = e.target;
      while (el && el.nodeType === 1 && el.tagName !== 'A') {
        el = el.parentNode;
      }
      if (!el || el.tagName !== 'A') return;
      var href = el.getAttribute('href');
      if (!isInternalHref(href)) return;
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      navigateInApp(resolveUrl(href));
    },
    true
  );

  onReady(function () {
    bindReloadButton();
    keepInAppNav();
    setupAppCacheAutoUpdate();
  });

  global.Kids.keepInAppNav = keepInAppNav;
  global.Kids.navigateInApp = navigateInApp;
})(window);
