(function () {
  'use strict';
  var K = Kids;
  var all = ['🐶', '🐱', '🐭', '🐷', '🐻', '🐸', '🍎', '🍌', '🍇', '🚗', '🚌', '⭐', '🌙', '⚽', '🎈', '📚'];
  var targets = [];
  var selected = {};

  var levels = K.createLevelController({
    gameId: 'zapomni',
    needed: 5,
    onLevelChange: resetIdle
  });

  function rememberCount(level) {
    if (level === 1) return 2;
    if (level === 2) return 3;
    return 4;
  }

  function fieldCount(level) {
    if (level === 1) return 6;
    if (level === 2) return 8;
    return 10;
  }

  function resetIdle() {
    K.$('main').innerHTML = '';
    K.$('choices').innerHTML = '';
    K.$('prompt').textContent = 'Нажми «Показать»';
    K.$('start-btn').style.display = 'inline-block';
    K.$('check-btn').style.display = 'none';
    selected = {};
  }

  function startRound() {
    var need = rememberCount(levels.getLevel());
    var fieldN = fieldCount(levels.getLevel());
    targets = K.sample(all, need);
    var rest = [];
    var i;
    for (i = 0; i < all.length; i++) {
      if (targets.indexOf(all[i]) === -1) rest.push(all[i]);
    }
    var field = K.shuffle(targets.concat(K.sample(rest, fieldN - need)));
    selected = {};
    K.$('start-btn').style.display = 'none';
    K.$('check-btn').style.display = 'none';
    K.$('choices').innerHTML = '';
    K.$('prompt').textContent = 'Запомни эти!';
    K.$('main').className = 'emo-row';
    K.$('main').textContent = targets.join('  ');
    setTimeout(function () {
      K.$('main').textContent = '';
      K.$('prompt').textContent = 'Отметь те, что были (' + need + ')';
      var box = K.$('choices');
      box.innerHTML = '';
      for (i = 0; i < field.length; i++) {
        (function (emoji) {
          var btn = K.emojiButton(emoji);
          btn.onclick = function () {
            if (selected[emoji]) {
              delete selected[emoji];
              btn.className = 'btn btn-choice is-emoji';
            } else {
              selected[emoji] = true;
              btn.className = 'btn btn-choice is-emoji is-selected';
            }
          };
          box.appendChild(btn);
        })(field[i]);
      }
      K.$('check-btn').style.display = 'inline-block';
    }, levels.getLevel() === 1 ? 2200 : 1800);
  }

  K.$('start-btn').onclick = startRound;
  K.$('check-btn').onclick = function () {
    var keys = [];
    var k;
    for (k in selected) {
      if (selected.hasOwnProperty(k) && selected[k]) keys.push(k);
    }
    if (keys.length !== targets.length) {
      levels.fail('Нужно выбрать ' + targets.length);
      return;
    }
    var ok = true;
    var i;
    for (i = 0; i < targets.length; i++) {
      if (!selected[targets[i]]) ok = false;
    }
    if (ok) {
      if (!levels.success()) resetIdle();
      else resetIdle();
    } else {
      levels.fail('Не все верные');
    }
  };

  resetIdle();
})();
