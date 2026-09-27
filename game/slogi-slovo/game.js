(function () {
  'use strict';
  var K = Kids;
  var current = null;
  var built = [];
  var letterState = [];

  var levels = K.createLevelController({
    gameId: 'slogi-slovo',
    needed: 5,
    onLevelChange: function () { nextRound(); }
  });

  function wordPool(level) {
    if (level === 1) return KidsData.wordsByLen(3, 3);
    if (level === 2) return KidsData.wordsByLen(4, 4);
    return KidsData.wordsByLen(5, 6);
  }

  function nextRound() {
    var pool = wordPool(levels.getLevel());
    current = K.pick(pool);
    built = [];
    letterState = K.shuffle(current.w.split('')).map(function (ch) {
      return { ch: ch, used: false };
    });
    K.$('prompt').textContent = 'Собери: ' + current.e;
    render();
  }

  function render() {
    var slots = K.$('slots');
    var letters = K.$('letters');
    var i, html = '';
    for (i = 0; i < current.w.length; i++) {
      html += '<span class="letter-slot">' + (built[i] || '') + '</span>';
    }
    slots.innerHTML = html;
    letters.innerHTML = '';
    for (i = 0; i < letterState.length; i++) {
      (function (idx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'letter-btn' + (letterState[idx].used ? ' is-used' : '');
        btn.textContent = letterState[idx].ch;
        btn.onclick = function () {
          if (letterState[idx].used) return;
          letterState[idx].used = true;
          built.push(letterState[idx].ch);
          render();
          if (built.length === current.w.length) {
            if (built.join('') === current.w) {
              if (!levels.success()) setTimeout(nextRound, 500);
            } else {
              levels.fail('Неверно, попробуй снова');
              setTimeout(nextRound, 700);
            }
          }
        };
        letters.appendChild(btn);
      })(i);
    }
  }

  nextRound();
})();
