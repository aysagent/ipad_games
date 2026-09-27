(function () {
  'use strict';
  var K = Kids;
  var all = ['🐶', '🐱', '🐭', '🐷', '🍎', '🍌', '🚗', '🚌', '⭐', '🌙', '⚽', '🎈'];
  var shown = [];
  var missing = '';

  var levels = K.createLevelController({
    gameId: 'chto-propalo',
    needed: 5,
    onLevelChange: function () {
      K.$('main').innerHTML = '';
      K.$('choices').innerHTML = '';
      K.$('prompt').textContent = 'Нажми «Показать»';
      K.$('start-btn').style.display = 'inline-block';
    }
  });

  function count(level) {
    if (level === 1) return 3;
    if (level === 2) return 4;
    return 5;
  }

  function showEmojis(list) {
    K.$('main').className = 'emo-row';
    K.$('main').textContent = list.join('  ');
  }

  function startRound() {
    var n = count(levels.getLevel());
    shown = K.sample(all, n);
    missing = K.pick(shown);
    K.$('start-btn').style.display = 'none';
    K.$('choices').innerHTML = '';
    K.$('prompt').textContent = 'Запомни!';
    showEmojis(shown);
    setTimeout(function () {
      var left = [];
      var i;
      for (i = 0; i < shown.length; i++) {
        if (shown[i] !== missing) left.push(shown[i]);
      }
      showEmojis(left);
      K.$('prompt').textContent = 'Что пропало?';
      var distractors = [];
      for (i = 0; i < all.length; i++) {
        if (shown.indexOf(all[i]) === -1) distractors.push(all[i]);
      }
      var opts = K.shuffle([missing].concat(K.sample(distractors, levels.getLevel() === 1 ? 2 : 3)));
      var box = K.$('choices');
      box.innerHTML = '';
      for (i = 0; i < opts.length; i++) {
        (function (emoji) {
          var btn = K.emojiButton(emoji);
          btn.onclick = function () {
            if (emoji === missing) {
              btn.className += ' is-right';
              if (!levels.success()) {
                K.$('start-btn').style.display = 'inline-block';
                K.$('prompt').textContent = 'Нажми «Показать»';
                K.$('main').innerHTML = '';
                K.$('choices').innerHTML = '';
              }
            } else {
              btn.className += ' is-wrong';
              levels.fail('Не то');
            }
          };
          box.appendChild(btn);
        })(opts[i]);
      }
    }, levels.getLevel() === 1 ? 2200 : 1800);
  }

  K.$('start-btn').onclick = startRound;
})();
