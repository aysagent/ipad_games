(function () {
  'use strict';
  var K = Kids;

  var levels = K.createLevelController({
    gameId: 'sezony',
    needed: 5,
    onLevelChange: function () { nextRound(); }
  });

  function nextRound() {
    var item = K.pick(KidsData.SEASONS);
    var wrongCount = levels.getLevel() === 1 ? 2 : 3;
    var wrong = K.sample(item.wrong, wrongCount);
    var opts = K.shuffle([{ e: item.right.e, t: item.right.t, ok: true }].concat(
      wrong.map(function (w) { return { e: w.e, t: w.t, ok: false }; })
    ));

    K.$('prompt').textContent = item.ask;
    K.$('main').innerHTML = '<div class="big-emoji">' + item.emoji + '</div><div style="font-weight:700;margin-top:6px">' + item.label + '</div>';

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
            levels.fail('Подумай ещё');
          }
        };
        box.appendChild(btn);
      })(opts[i]);
    }
  }

  nextRound();
})();
