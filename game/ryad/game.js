(function () {
  'use strict';
  var K = Kids;

  /* Эмодзи, которые есть на iOS 9 */
  var patterns = [
    { seq: ['🔴', '🔵', '🔴', '🔵'], next: '🔴', distractors: ['🔵', '🟢', '🟡'] },
    { seq: ['⭐', '⭐', '🌙', '⭐', '⭐'], next: '🌙', distractors: ['⭐', '☀️', '☁️'] },
    { seq: ['🐶', '🐱', '🐶', '🐱'], next: '🐶', distractors: ['🐱', '🐭', '🐷'] },
    { seq: ['1️⃣', '2️⃣', '3️⃣'], next: '4️⃣', distractors: ['5️⃣', '2️⃣', '1️⃣'] },
    { seq: ['❤️', '❤️', '💙', '❤️', '❤️'], next: '💙', distractors: ['❤️', '💛', '💚'] },
    { seq: ['🍎', '🍌', '🍎', '🍌'], next: '🍎', distractors: ['🍌', '🍇', '🍊'] },
    { seq: ['🚗', '🚌', '🚗', '🚌', '🚗'], next: '🚌', distractors: ['🚗', '✈️', '🚲'] },
    { seq: ['⬆️', '➡️', '⬇️'], next: '⬅️', distractors: ['⬆️', '➡️', '⬇️'] },
    { seq: ['🐸', '🐸', '🐢', '🐸', '🐸'], next: '🐢', distractors: ['🐸', '🐟', '🐦'] },
    { seq: ['😀', '😀', '😢', '😀', '😀'], next: '😢', distractors: ['😀', '😡', '😴'] }
  ];

  var hard = [
    { seq: ['🔴', '🔴', '🔵', '🔴', '🔴', '🔵'], next: '🔴', distractors: ['🔵', '🟢', '🟡'] },
    { seq: ['1️⃣', '3️⃣', '5️⃣'], next: '7️⃣', distractors: ['6️⃣', '4️⃣', '8️⃣'] },
    { seq: ['⭐', '🌙', '⭐', '🌙', '⭐'], next: '🌙', distractors: ['⭐', '☀️', '☁️'] },
    { seq: ['🅰️', '🅱️', '🅰️', '🅱️'], next: '🅰️', distractors: ['🅱️', '©️', '⭕'] }
  ];

  var levels = K.createLevelController({
    gameId: 'ryad',
    needed: 5,
    onLevelChange: function () { nextRound(); }
  });

  function nextRound() {
    var pool = levels.getLevel() >= 3 ? patterns.concat(hard) : patterns;
    var item = K.pick(pool);
    var shown = item.seq.slice();
    if (levels.getLevel() === 1 && shown.length > 4) {
      shown = shown.slice(0, 4);
    }
    var row = K.$('row');
    row.className = 'emo-row';
    row.textContent = shown.join(' ') + '  ?';

    var opts = K.shuffle([item.next].concat(K.sample(item.distractors, levels.getLevel() === 1 ? 2 : 3)));
    var box = K.$('choices');
    box.innerHTML = '';
    var i;
    for (i = 0; i < opts.length; i++) {
      (function (emoji) {
        var btn = K.emojiButton(emoji);
        btn.onclick = function () {
          if (emoji === item.next) {
            btn.className += ' is-right';
            if (!levels.success()) setTimeout(nextRound, 450);
          } else {
            btn.className += ' is-wrong';
            levels.fail('Посмотри на ряд');
          }
        };
        box.appendChild(btn);
      })(opts[i]);
    }
  }

  nextRound();
})();
