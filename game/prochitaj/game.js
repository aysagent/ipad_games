(function () {
  'use strict';
  var K = Kids;
  var steps = [];
  var stepIndex = 0;

  var levels = K.createLevelController({
    gameId: 'prochitaj',
    needed: 5,
    onLevelChange: function () { nextRound(); }
  });

  function nextRound() {
    var level = levels.getLevel();
    var count = level >= 3 ? 2 : 1;
    steps = K.sample(KidsData.COMMANDS, count);
    stepIndex = 0;
    showStep();
  }

  function showStep() {
    var cmd = steps[stepIndex];
    var extra = steps.length > 1 ? ' (шаг ' + (stepIndex + 1) + ' из ' + steps.length + ')' : '';
    K.$('prompt').textContent = cmd.text + extra;
    var opts = K.shuffle([cmd.target].concat(K.sample(cmd.distractors, levels.getLevel() === 1 ? 2 : 3)));
    var box = K.$('choices');
    box.innerHTML = '';
    var i;
    for (i = 0; i < opts.length; i++) {
      (function (emoji) {
        var btn = K.emojiButton(emoji);
        btn.onclick = function () {
          if (emoji === cmd.target) {
            btn.className += ' is-right';
            stepIndex += 1;
            if (stepIndex >= steps.length) {
              if (!levels.success()) setTimeout(nextRound, 450);
            } else {
              K.showFeedback('Дальше!', true);
              setTimeout(showStep, 400);
            }
          } else {
            btn.className += ' is-wrong';
            levels.fail('Прочитай ещё раз');
            stepIndex = 0;
            setTimeout(showStep, 500);
          }
        };
        box.appendChild(btn);
      })(opts[i]);
    }
  }

  nextRound();
})();
