(function () {
  'use strict';
  var K = Kids;

  var levels = K.createLevelController({
    gameId: 'lishnee',
    needed: 5,
    onLevelChange: function () { nextRound(); }
  });

  function nextRound() {
    var group = K.pick(KidsData.ODD_GROUPS);
    var same = K.sample(group.items, 3);
    var odd = K.pick(group.oddFrom);
    var opts = K.shuffle(same.concat([odd]));
    var box = K.$('choices');
    box.innerHTML = '';
    var i;
    for (i = 0; i < opts.length; i++) {
      (function (emoji) {
        var btn = K.emojiButton(emoji);
        btn.onclick = function () {
          if (emoji === odd) {
            btn.className += ' is-right';
            if (!levels.success()) setTimeout(nextRound, 450);
          } else {
            btn.className += ' is-wrong';
            levels.fail('Это подходит к группе');
          }
        };
        box.appendChild(btn);
      })(opts[i]);
    }
  }

  nextRound();
})();
