(function () {
  'use strict';
  var K = Kids;

  var levels = K.createLevelController({
    gameId: 'primery',
    needed: 5,
    onLevelChange: function () { nextRound(); }
  });

  function nextRound() {
    var level = levels.getLevel();
    var limit = level === 1 ? 10 : 20;
    var op = level === 1 ? '+' : (Math.random() > 0.45 ? '+' : '−');
    var a, b, ans;
    if (op === '+') {
      a = K.randomInt(1, Math.min(9, limit - 1));
      b = K.randomInt(1, limit - a);
      ans = a + b;
    } else {
      a = K.randomInt(2, limit);
      b = K.randomInt(1, a);
      ans = a - b;
    }

    K.$('main').textContent = a + ' ' + op + ' ' + b + ' = ?';
    if (level === 1 && op === '+') {
      K.$('visual').textContent = repeat('⭐', a) + '  +  ' + repeat('⭐', b);
    } else if (level === 1) {
      K.$('visual').textContent = repeat('⭐', a) + '  −  ' + repeat('⭐', b);
    } else {
      K.$('visual').textContent = '';
    }

    var opts = [ans];
    while (opts.length < 4) {
      var n = K.randomInt(0, limit);
      if (opts.indexOf(n) === -1) opts.push(n);
    }
    opts = K.shuffle(opts);
    var box = K.$('choices');
    box.innerHTML = '';
    var i;
    for (i = 0; i < opts.length; i++) {
      (function (n) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-choice';
        btn.textContent = String(n);
        btn.onclick = function () {
          if (n === ans) {
            btn.className += ' is-right';
            if (!levels.success()) setTimeout(nextRound, 450);
          } else {
            btn.className += ' is-wrong';
            levels.fail('Посчитай ещё раз');
          }
        };
        box.appendChild(btn);
      })(opts[i]);
    }
  }

  function repeat(ch, n) {
    var s = '', i;
    for (i = 0; i < n; i++) s += ch;
    return s;
  }

  nextRound();
})();
