(function () {
  'use strict';

  var hintEl = document.getElementById('hint');
  function showHint(msg) {
    if (hintEl) hintEl.textContent = msg;
  }

  if (!window.Kids) {
    showHint('Не загрузился common.js');
    return;
  }

  var K = Kids;

  /* 2 октавы: До4 … До6 */
  var WHITE = [
    { id: 'c4', name: 'До', freq: 261.63 },
    { id: 'd4', name: 'Ре', freq: 293.66 },
    { id: 'e4', name: 'Ми', freq: 329.63 },
    { id: 'f4', name: 'Фа', freq: 349.23 },
    { id: 'g4', name: 'Соль', freq: 392.0 },
    { id: 'a4', name: 'Ля', freq: 440.0 },
    { id: 'b4', name: 'Си', freq: 493.88 },
    { id: 'c5', name: 'До', freq: 523.25 },
    { id: 'd5', name: 'Ре', freq: 587.33 },
    { id: 'e5', name: 'Ми', freq: 659.25 },
    { id: 'f5', name: 'Фа', freq: 698.46 },
    { id: 'g5', name: 'Соль', freq: 783.99 },
    { id: 'a5', name: 'Ля', freq: 880.0 },
    { id: 'b5', name: 'Си', freq: 987.77 },
    { id: 'c6', name: 'До', freq: 1046.5 }
  ];

  var BLACK = [
    { id: 'cs4', freq: 277.18, after: 0 },
    { id: 'ds4', freq: 311.13, after: 1 },
    { id: 'fs4', freq: 369.99, after: 3 },
    { id: 'gs4', freq: 415.3, after: 4 },
    { id: 'as4', freq: 466.16, after: 5 },
    { id: 'cs5', freq: 554.37, after: 7 },
    { id: 'ds5', freq: 622.25, after: 8 },
    { id: 'fs5', freq: 739.99, after: 10 },
    { id: 'gs5', freq: 830.61, after: 11 },
    { id: 'as5', freq: 932.33, after: 12 }
  ];

  var noteById = {};
  var blackIds = {};
  var i;
  for (i = 0; i < WHITE.length; i++) noteById[WHITE[i].id] = WHITE[i];
  for (i = 0; i < BLACK.length; i++) {
    noteById[BLACK[i].id] = BLACK[i];
    blackIds[BLACK[i].id] = true;
  }

  var MELODIES = [
    { title: 'Вверх по гамме', notes: ['c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4', 'c5'] },
    { title: 'Кукушка', notes: ['g4', 'e4', 'g4', 'e4', 'g4', 'e4', 'c4'] },
    {
      title: 'Мир большой',
      notes: ['c4', 'c4', 'g4', 'g4', 'a4', 'a4', 'g4', 'f4', 'f4', 'e4', 'e4', 'd4', 'd4', 'c4']
    },
    {
      title: 'Маленькая песенка',
      notes: ['e4', 'd4', 'c4', 'd4', 'e4', 'e4', 'e4', 'd4', 'd4', 'd4', 'e4', 'g4', 'g4']
    }
  ];

  var KEY_H = Math.round(240 * 1.3); /* +30% к прежним 240px → 312 */
  var audioCtx = null;
  var mode = 'free';
  var expect = [];
  var expectPos = 0;
  var playingDemo = false;
  var activeMelody = 0;
  var building = false;

  function isBlackId(id) {
    return !!blackIds[id];
  }

  function ensureAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      showHint('Нет Web Audio на этом iPad');
      return null;
    }
    if (!audioCtx) {
      try {
        audioCtx = new AC();
      } catch (e) {
        showHint('Звук не включился');
        return null;
      }
    }
    if (audioCtx.state === 'suspended' && audioCtx.resume) {
      try {
        audioCtx.resume();
      } catch (e2) {}
    }
    try {
      var buf = audioCtx.createBuffer(1, 1, 22050);
      var src = audioCtx.createBufferSource();
      src.buffer = buf;
      src.connect(audioCtx.destination);
      if (src.start) src.start(0);
      else if (src.noteOn) src.noteOn(0);
    } catch (e3) {}
    return audioCtx;
  }

  function makeGain(ctx) {
    if (ctx.createGain) return ctx.createGain();
    if (ctx.createGainNode) return ctx.createGainNode();
    return null;
  }

  function playTone(freq, dur) {
    var ctx = ensureAudio();
    if (!ctx) return;
    dur = dur || 0.45;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = makeGain(ctx);
    if (!gain) return;
    try {
      osc.type = 'triangle';
    } catch (e) {
      try {
        osc.type = 1;
      } catch (e2) {}
    }
    if (osc.frequency.setValueAtTime) osc.frequency.setValueAtTime(freq, now);
    else osc.frequency.value = freq;
    if (gain.gain.setValueAtTime) {
      gain.gain.setValueAtTime(0.001, now);
      if (gain.gain.linearRampToValueAtTime) {
        gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
        gain.gain.linearRampToValueAtTime(0.001, now + dur);
      } else gain.gain.value = 0.3;
    } else gain.gain.value = 0.3;
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (osc.start) osc.start(now);
    else if (osc.noteOn) osc.noteOn(0);
    if (osc.stop) osc.stop(now + dur + 0.05);
    else if (osc.noteOff) {
      setTimeout(function () {
        try {
          osc.noteOff(0);
        } catch (e3) {}
      }, (dur + 0.05) * 1000);
    }
  }

  function playNoteId(id, dur) {
    var n = noteById[id];
    if (!n) return;
    playTone(n.freq, dur);
    flashKey(id);
  }

  function flashKey(id) {
    var el = document.getElementById('key-' + id);
    if (!el) return;
    var prev = el.style.backgroundColor;
    el.style.backgroundColor = isBlackId(id) ? '#666' : '#b8e0c8';
    setTimeout(function () {
      el.style.backgroundColor = prev || (isBlackId(id) ? '#222' : '#fff8ee');
    }, 160);
  }

  function viewportWidth() {
    var w = window.innerWidth || 0;
    var dw = document.documentElement ? document.documentElement.clientWidth : 0;
    var bw = document.body ? document.body.clientWidth : 0;
    var best = Math.max(w, dw, bw);
    return best > 40 ? best : 1024;
  }

  function viewportHeight() {
    return (
      window.innerHeight ||
      (document.documentElement && document.documentElement.clientHeight) ||
      (document.body && document.body.clientHeight) ||
      768
    );
  }

  function forceFullBleed() {
    var app = document.getElementById('piano-app');
    var body = document.getElementById('piano-body');
    var kb = document.getElementById('keyboard');
    var vw = viewportWidth();
    if (document.documentElement) {
      document.documentElement.style.width = '100%';
      document.documentElement.style.margin = '0';
      document.documentElement.style.padding = '0';
    }
    if (document.body) {
      document.body.style.width = '100%';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.maxWidth = 'none';
    }
    if (app) {
      app.style.cssText =
        'max-width:none!important;width:100%!important;margin:0!important;' +
        'padding:4px 0 0!important;height:100%;overflow:hidden;' +
        '-webkit-box-sizing:border-box;box-sizing:border-box';
    }
    if (body) {
      body.style.cssText =
        'display:block;position:relative;left:0;top:0;margin:0;padding:0;' +
        'border:none;border-radius:0;background:#111;max-width:none;' +
        'width:' +
        vw +
        'px';
      /* если родитель всё ещё со сдвигом — компенсируем */
      try {
        var shift = Math.round(body.getBoundingClientRect().left);
        if (shift) {
          body.style.marginLeft = -shift + 'px';
          body.style.width = vw + 'px';
        }
      } catch (e) {}
    }
    if (kb) {
      kb.style.width = vw + 'px';
      kb.style.maxWidth = 'none';
      kb.style.margin = '0';
      kb.style.padding = '0';
      kb.style.left = '0';
      kb.style.display = 'block';
    }
    return vw;
  }

  function fitKeyboardHeight(kb) {
    kb.style.height = KEY_H + 'px';
    var top = 0;
    try {
      top = kb.getBoundingClientRect().top;
    } catch (e) {}
    var viewH = viewportHeight();
    var hintH = hintEl ? 20 : 0;
    var avail = Math.floor(viewH - top - hintH - 4);
    var h = KEY_H;
    if (avail > 0 && avail < KEY_H) h = Math.max(180, avail);
    kb.style.height = h + 'px';
    return h;
  }

  function shortName(name, keyW) {
    if (keyW >= 42) return name;
    if (name === 'Соль') return 'Со';
    return name;
  }

  function buildKeyboard() {
    if (building) return;
    building = true;
    var kb = document.getElementById('keyboard');
    if (!kb) {
      building = false;
      return;
    }

    var nWhite = WHITE.length;

    kb.innerHTML = '';
    kb.style.position = 'relative';
    kb.style.backgroundColor = '#111';
    kb.style.overflow = 'hidden';

    var boxW = forceFullBleed();
    var boxH = fitKeyboardHeight(kb);
    if (!boxW || boxW < 40) {
      building = false;
      setTimeout(buildKeyboard, 50);
      return;
    }

    var cell = boxW / nWhite;
    var fontPx = cell >= 44 ? 13 : cell >= 34 ? 11 : 9;

    var w;
    for (w = 0; w < nWhite; w++) {
      (function (note, index) {
        var left = Math.floor((index * boxW) / nWhite);
        var right = Math.floor(((index + 1) * boxW) / nWhite);
        var keyW = right - left;
        if (keyW < 12) keyW = 12;

        var btn = document.createElement('div');
        btn.id = 'key-' + note.id;
        btn.style.position = 'absolute';
        btn.style.left = left + 'px';
        btn.style.top = '0';
        btn.style.width = keyW + 'px';
        btn.style.height = boxH + 'px';
        btn.style.backgroundColor = '#fff8ee';
        btn.style.borderLeft = index === 0 ? '1px solid #000' : 'none';
        btn.style.borderRight = '1px solid #000';
        btn.style.borderTop = '1px solid #000';
        btn.style.borderBottom = '1px solid #000';
        btn.style.borderBottomLeftRadius = '5px';
        btn.style.borderBottomRightRadius = '5px';
        btn.style.webkitBoxSizing = 'border-box';
        btn.style.boxSizing = 'border-box';
        btn.style.zIndex = '1';
        btn.style.textAlign = 'center';

        var label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.left = '0';
        label.style.right = '0';
        label.style.bottom = '10px';
        label.style.fontSize = fontPx + 'px';
        label.style.fontWeight = 'bold';
        label.style.color = '#222';
        label.style.lineHeight = '1.1';
        label.appendChild(document.createTextNode(shortName(note.name, keyW)));
        btn.appendChild(label);

        bindKey(btn, note.id);
        kb.appendChild(btn);
      })(WHITE[w], w);
    }

    var b;
    var blackW = Math.max(14, Math.floor(cell * 0.62));
    for (b = 0; b < BLACK.length; b++) {
      (function (note) {
        var seam = Math.floor(((note.after + 1) * boxW) / nWhite);
        var left = Math.floor(seam - blackW / 2);
        if (left < 0) left = 0;
        if (left + blackW > boxW) left = boxW - blackW;

        var btn = document.createElement('div');
        btn.id = 'key-' + note.id;
        btn.style.position = 'absolute';
        btn.style.left = left + 'px';
        btn.style.top = '0';
        btn.style.width = blackW + 'px';
        btn.style.height = Math.floor(boxH * 0.58) + 'px';
        btn.style.backgroundColor = '#222';
        btn.style.border = '1px solid #000';
        btn.style.borderBottomLeftRadius = '4px';
        btn.style.borderBottomRightRadius = '4px';
        btn.style.webkitBoxSizing = 'border-box';
        btn.style.boxSizing = 'border-box';
        btn.style.zIndex = '3';
        bindKey(btn, note.id);
        kb.appendChild(btn);
      })(BLACK[b]);
    }

    showHint('2 октавы · ' + nWhite + ' белых + чёрные');
    building = false;
  }

  function bindKey(el, noteId) {
    function down(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
      ensureAudio();
      if (playingDemo) return;
      playTone(noteById[noteId].freq, 0.4);
      el.style.backgroundColor = isBlackId(noteId) ? '#666' : '#b8e0c8';
      onUserNote(noteId);
    }
    function up(e) {
      if (e && e.preventDefault) e.preventDefault();
      el.style.backgroundColor = isBlackId(noteId) ? '#222' : '#fff8ee';
    }
    el.addEventListener('touchstart', down, false);
    el.addEventListener('touchend', up, false);
    el.addEventListener('touchcancel', up, false);
    el.addEventListener('mousedown', down, false);
    el.addEventListener('mouseup', up, false);
    el.addEventListener('mouseleave', up, false);
  }

  function setMode(next) {
    mode = next;
    expect = [];
    expectPos = 0;
    K.$('mode-free').className = 'btn' + (mode === 'free' ? ' btn-secondary' : '');
    K.$('mode-learn').className = 'btn' + (mode === 'learn' ? ' btn-secondary' : '');
    if (mode === 'free') {
      K.$('melody-btns').style.display = 'none';
      K.$('prompt').textContent = 'Свободная игра — 2 октавы';
      setTimeout(buildKeyboard, 30);
    } else {
      K.$('prompt').textContent = 'Выбери мелодию и повтори';
      setupLearnUi();
      setTimeout(buildKeyboard, 30);
    }
  }

  function setupLearnUi() {
    var box = K.$('melody-btns');
    box.style.display = 'block';
    box.innerHTML = '';
    var mi;
    for (mi = 0; mi < MELODIES.length; mi++) {
      (function (idx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-ghost';
        btn.textContent = MELODIES[idx].title;
        btn.onclick = function () {
          ensureAudio();
          startMelody(idx);
        };
        box.appendChild(btn);
      })(mi);
    }
    var listen = document.createElement('button');
    listen.type = 'button';
    listen.className = 'btn';
    listen.textContent = 'Слушать ещё раз';
    listen.onclick = function () {
      ensureAudio();
      playDemo(expect.slice());
    };
    box.appendChild(listen);
    startMelody(activeMelody);
  }

  function startMelody(idx) {
    activeMelody = idx;
    expect = MELODIES[idx].notes.slice();
    expectPos = 0;
    K.$('prompt').textContent = 'Слушай: «' + MELODIES[idx].title + '»';
    showHint('Потом нажми те же ноты');
    playDemo(expect.slice());
  }

  function playDemo(seq) {
    if (!seq.length) return;
    playingDemo = true;
    var step = 0;
    function tick() {
      if (step >= seq.length) {
        playingDemo = false;
        expectPos = 0;
        K.$('prompt').textContent = 'Теперь повтори сам!';
        return;
      }
      playNoteId(seq[step], 0.35);
      step += 1;
      setTimeout(tick, 480);
    }
    setTimeout(tick, 400);
  }

  function onUserNote(noteId) {
    if (mode !== 'learn' || playingDemo || !expect.length) return;
    if (noteId === expect[expectPos]) {
      expectPos += 1;
      showHint('Верно! ' + expectPos + ' / ' + expect.length);
      if (expectPos >= expect.length) {
        K.$('prompt').textContent = 'Мелодия получилась!';
        K.showFeedback('Молодец!', true);
        expect = [];
        expectPos = 0;
      }
    } else {
      K.showFeedback('Не та нота', false);
      expectPos = 0;
      setTimeout(function () {
        playDemo(expect.slice());
      }, 500);
    }
  }

  K.$('mode-free').onclick = function () {
    ensureAudio();
    setMode('free');
  };
  K.$('mode-learn').onclick = function () {
    ensureAudio();
    setMode('learn');
  };

  function unlockOnce() {
    ensureAudio();
    document.removeEventListener('touchstart', unlockOnce, false);
    document.removeEventListener('mousedown', unlockOnce, false);
  }
  document.addEventListener('touchstart', unlockOnce, false);
  document.addEventListener('mousedown', unlockOnce, false);

  var resizeTimer = null;
  function onResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildKeyboard, 120);
  }
  window.addEventListener('resize', onResize, false);
  window.addEventListener('orientationchange', function () {
    setTimeout(buildKeyboard, 200);
  }, false);

  function start() {
    try {
      buildKeyboard();
      setMode('free');
    } catch (err) {
      showHint('Ошибка: ' + (err && err.message ? err.message : String(err)));
    }
  }

  if (window.addEventListener) window.addEventListener('load', start, false);
  setTimeout(start, 80);
  setTimeout(buildKeyboard, 350);
})();
