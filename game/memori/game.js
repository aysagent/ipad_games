(function () {
  'use strict';
  var K = Kids;
  var icons = ['🐶', '🐱', '🐭', '🦊', '🐻', '🐸', '🐧', '🐷'];
  var cards = [];
  var open = [];
  var lock = false;
  var matched = 0;

  var levels = K.createLevelController({
    gameId: 'memori',
    needed: 1,
    onLevelChange: function () { startBoard(); }
  });

  function pairCount(level) {
    if (level === 1) return 3;
    if (level === 2) return 6;
    return 8;
  }

  function startBoard() {
    var n = pairCount(levels.getLevel());
    var chosen = K.sample(icons, n);
    var list = [];
    var i;
    for (i = 0; i < chosen.length; i++) {
      list.push(chosen[i], chosen[i]);
    }
    list = K.shuffle(list);
    cards = [];
    open = [];
    lock = false;
    matched = 0;
    var board = K.$('board');
    board.innerHTML = '';
    for (i = 0; i < list.length; i++) {
      (function (idx) {
        var el = document.createElement('div');
        el.className = 'mem-card';
        el.textContent = '?';
        el.onclick = function () { flip(idx); };
        board.appendChild(el);
        cards.push({ emoji: list[idx], el: el, matched: false, open: false });
      })(i);
    }
  }

  function flip(idx) {
    if (lock) return;
    var c = cards[idx];
    if (c.matched || c.open) return;
    c.open = true;
    c.el.className = 'mem-card is-open';
    c.el.textContent = c.emoji;
    open.push(idx);
    if (open.length < 2) return;
    lock = true;
    var a = cards[open[0]];
    var b = cards[open[1]];
    if (a.emoji === b.emoji) {
      a.matched = true;
      b.matched = true;
      a.el.className = 'mem-card is-open is-matched';
      b.el.className = 'mem-card is-open is-matched';
      matched += 1;
      open = [];
      lock = false;
      K.showFeedback('Пара!', true);
      if (matched >= pairCount(levels.getLevel())) {
        levels.success();
      }
    } else {
      setTimeout(function () {
        a.open = false;
        b.open = false;
        a.el.className = 'mem-card';
        b.el.className = 'mem-card';
        a.el.textContent = '?';
        b.el.textContent = '?';
        open = [];
        lock = false;
      }, 700);
    }
  }

  startBoard();
})();
