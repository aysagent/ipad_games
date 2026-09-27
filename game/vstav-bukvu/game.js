(function () {
  'use strict';
  var K = Kids;
  var alphabet = 'абвгдежзийклмнопрстуфхцчшщъыьэюя';

  var levels = K.createLevelController({
    gameId: 'vstav-bukvu',
    needed: 5,
    onLevelChange: function () { nextRound(); }
  });

  function pool(level) {
    if (level === 1) return KidsData.wordsByLen(3, 4);
    if (level === 2) return KidsData.wordsByLen(4, 5);
    return KidsData.wordsByLen(5, 6);
  }

  function nextRound() {
    var item = K.pick(pool(levels.getLevel()));
    var idx = K.randomInt(0, item.w.length - 1);
    var missing = item.w.charAt(idx);
    var shown = item.w.substring(0, idx) + '_' + item.w.substring(idx + 1);
    var nChoices = levels.getLevel() === 1 ? 3 : 4;
    var opts = [missing];
    while (opts.length < nChoices) {
      var ch = alphabet.charAt(K.randomInt(0, alphabet.length - 1));
      if (opts.indexOf(ch) === -1) opts.push(ch);
    }
    opts = K.shuffle(opts);

    K.$('prompt').textContent = 'Какой буквы не хватает? ' + item.e;
    K.$('main').textContent = shown;

    var box = K.$('choices');
    box.innerHTML = '';
    var i;
    for (i = 0; i < opts.length; i++) {
      (function (ch) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-choice letter-btn';
        btn.textContent = ch;
        btn.onclick = function () {
          if (ch === missing) {
            btn.className += ' is-right';
            K.$('main').textContent = item.w;
            if (!levels.success()) setTimeout(nextRound, 450);
          } else {
            btn.className += ' is-wrong';
            levels.fail('Не та буква');
          }
        };
        box.appendChild(btn);
      })(opts[i]);
    }
  }

  nextRound();
})();
