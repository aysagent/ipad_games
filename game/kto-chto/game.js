(function () {
  'use strict';
  var K = Kids;

  var levels = K.createLevelController({
    gameId: 'kto-chto',
    needed: 5,
    onLevelChange: function () { nextRound(); }
  });

  function nextRound() {
    var item = K.pick(KidsData.WHO_WHAT);
    var wrongCount = levels.getLevel() === 1 ? 2 : 3;
    var wrong = K.sample(item.wrong, Math.min(wrongCount, item.wrong.length));
    var opts = K.shuffle([{ e: item.right.e, t: item.right.t, ok: true }].concat(
      wrong.map(function (w) { return { e: w.e, t: w.t, ok: false }; })
    ));

    K.$('prompt').textContent = item.q;
    K.$('main').innerHTML = '<div class="big-emoji">' + item.qe + '</div>';

    var box = K.$('choices');
    box.innerHTML = '';
    var i;
    for (i = 0; i < opts.length; i++) {
      (function (opt) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-choice';
        btn.innerHTML = '<div class="emo-md">' + opt.e + '</div><div style="font-size:0.9em;margin-top:4px">' + opt.t + '</div>';
        btn.onclick = function () {
          if (opt.ok) {
            btn.className += ' is-right';
            if (!levels.success()) setTimeout(nextRound, 450);
          } else {
            btn.className += ' is-wrong';
            levels.fail('Неверно');
          }
        };
        box.appendChild(btn);
      })(opts[i]);
    }
  }

  nextRound();
})();
