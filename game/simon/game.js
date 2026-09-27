(function () {
  'use strict';
  var K = Kids;
  var colors = [
    { id: 0, bg: '#e74c3c' },
    { id: 1, bg: '#3498db' },
    { id: 2, bg: '#2ecc71' },
    { id: 3, bg: '#f1c40f' }
  ];
  var seq = [];
  var input = [];
  var playing = false;
  var accepting = false;
  var pads = [];

  var levels = K.createLevelController({
    gameId: 'simon',
    needed: 3,
    onLevelChange: function () {
      seq = [];
      K.$('prompt').textContent = 'Нажми Старт';
    }
  });

  function startLen(level) {
    if (level === 1) return 2;
    if (level === 2) return 3;
    return 4;
  }

  function buildPads() {
    var box = K.$('pads');
    box.innerHTML = '';
    pads = [];
    var i;
    for (i = 0; i < colors.length; i++) {
      (function (c) {
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'simon-pad';
        el.style.background = c.bg;
        el.onclick = function () { onPad(c.id); };
        box.appendChild(el);
        pads.push(el);
      })(colors[i]);
    }
  }

  function light(id, on) {
    if (pads[id]) {
      pads[id].className = 'simon-pad' + (on ? ' is-lit' : '');
    }
  }

  function playSeq(cb) {
    accepting = false;
    playing = true;
    K.$('prompt').textContent = 'Смотри...';
    var i = 0;
    function step() {
      if (i >= seq.length) {
        playing = false;
        accepting = true;
        input = [];
        K.$('prompt').textContent = 'Повтори!';
        if (cb) cb();
        return;
      }
      var id = seq[i];
      light(id, true);
      setTimeout(function () {
        light(id, false);
        i += 1;
        setTimeout(step, 280);
      }, 450);
    }
    setTimeout(step, 400);
  }

  function onPad(id) {
    if (!accepting || playing) return;
    light(id, true);
    setTimeout(function () { light(id, false); }, 200);
    input.push(id);
    var idx = input.length - 1;
    if (input[idx] !== seq[idx]) {
      accepting = false;
      levels.fail('Не та последовательность');
      K.$('prompt').textContent = 'Нажми Старт';
      return;
    }
    if (input.length === seq.length) {
      accepting = false;
      if (!levels.success()) {
        K.$('prompt').textContent = 'Дальше!';
        setTimeout(function () {
          seq.push(K.randomInt(0, 3));
          playSeq();
        }, 600);
      } else {
        K.$('prompt').textContent = 'Нажми Старт';
      }
    }
  }

  K.$('start-btn').onclick = function () {
    if (playing) return;
    seq = [];
    var n = startLen(levels.getLevel());
    var i;
    for (i = 0; i < n; i++) seq.push(K.randomInt(0, 3));
    playSeq();
  };

  buildPads();
})();
