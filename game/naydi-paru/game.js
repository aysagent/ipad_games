(function () {
  'use strict';
  var K = Kids;
  var modeWordToPic = true;

  var levels = K.createLevelController({
    gameId: 'naydi-paru',
    needed: 5,
    onLevelChange: function () { nextRound(); }
  });

  function choiceCount(level) {
    return level === 1 ? 3 : 4;
  }

  function nextRound() {
    modeWordToPic = Math.random() > 0.5;
    var level = levels.getLevel();
    var pool = KidsData.WORDS.slice();
    var target = K.pick(pool);
    var others = [];
    var i;
    for (i = 0; i < pool.length; i++) {
      if (pool[i].w !== target.w) others.push(pool[i]);
    }
    others = K.sample(others, choiceCount(level) - 1);
    var options = K.shuffle(others.concat([target]));

    if (modeWordToPic) {
      K.$('prompt').textContent = 'Найди картинку к слову';
      K.$('main').innerHTML = '<div style="font-size:2em;font-weight:700">' + target.w + '</div>';
    } else {
      K.$('prompt').textContent = 'Найди слово к картинке';
      K.$('main').innerHTML = '<div class="big-emoji">' + target.e + '</div>';
    }

    var box = K.$('choices');
    box.innerHTML = '';
    for (i = 0; i < options.length; i++) {
      (function (opt) {
        var btn;
        if (modeWordToPic) {
          btn = K.emojiButton(opt.e);
        } else {
          btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'btn btn-choice';
          btn.textContent = opt.w;
        }
        btn.onclick = function () {
          if (opt.w === target.w) {
            btn.className += ' is-right';
            if (!levels.success()) setTimeout(nextRound, 450);
          } else {
            btn.className += ' is-wrong';
            levels.fail('Это не то');
          }
        };
        box.appendChild(btn);
      })(options[i]);
    }
  }

  nextRound();
})();
