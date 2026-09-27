(function () {
  'use strict';
  var K = Kids;
  var emojis = ['⭐', '🍎', '🔵', '🐶', '🎈', '🐟'];

  var levels = K.createLevelController({
    gameId: 'chto-bolshe',
    needed: 5,
    onLevelChange: function () { nextRound(); }
  });

  function maxNum(level) {
    if (level === 1) return 5;
    if (level === 2) return 10;
    return 15;
  }

  function nextRound() {
    var max = maxNum(levels.getLevel());
    var a = K.randomInt(0, max);
    var b = K.randomInt(0, max);
    var usePiles = levels.getLevel() < 3 || Math.random() > 0.4;
    var emoji = K.pick(emojis);
    var html = '';

    if (usePiles) {
      html += '<div class="pile"><div class="pile-emoji">' + repeat(emoji, a) + '</div><div class="pile-num">' + a + '</div></div>';
      html += '<div class="pile"><div class="pile-emoji">' + repeat(emoji, b) + '</div><div class="pile-num">' + b + '</div></div>';
    } else {
      html += '<div class="pile"><div class="pile-num" style="font-size:3em">' + a + '</div></div>';
      html += '<div class="pile"><div class="pile-num" style="font-size:3em">' + b + '</div></div>';
    }
    K.$('compare').innerHTML = html;
    K.$('prompt').textContent = 'Что больше?';

    var answer = a > b ? 'left' : (a < b ? 'right' : 'eq');
    var box = K.$('choices');
    box.innerHTML = '';
    addBtn(box, 'Левое больше', 'left', answer);
    addBtn(box, 'Равны', 'eq', answer);
    addBtn(box, 'Правое больше', 'right', answer);
  }

  function repeat(ch, n) {
    var s = '', i;
    for (i = 0; i < n; i++) s += ch;
    return s || '—';
  }

  function addBtn(box, label, val, answer) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-choice';
    btn.textContent = label;
    btn.onclick = function () {
      if (val === answer) {
        btn.className += ' is-right';
        if (!levels.success()) setTimeout(nextRound, 450);
      } else {
        btn.className += ' is-wrong';
        levels.fail('Посмотри внимательнее');
      }
    };
    box.appendChild(btn);
  }

  nextRound();
})();
