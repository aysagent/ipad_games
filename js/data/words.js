/* Shared word/picture data — loaded as classic script */
window.KidsData = window.KidsData || {};

KidsData.WORDS = [
  { w: 'кот', e: '🐱' },
  { w: 'дом', e: '🏠' },
  { w: 'сок', e: '🧃' },
  { w: 'лес', e: '🌲' },
  { w: 'мир', e: '🌍' },
  { w: 'мак', e: '🌺' },
  { w: 'рак', e: '🦞' },
  { w: 'шар', e: '🎈' },
  { w: 'сыр', e: '🧀' },
  { w: 'нос', e: '👃' },
  { w: 'рыба', e: '🐟' },
  { w: 'луна', e: '🌙' },
  { w: 'река', e: '🏞️' },
  { w: 'рука', e: '✋' },
  { w: 'нога', e: '🦶' },
  { w: 'глаз', e: '👁️' },
  { w: 'мышь', e: '🐭' },
  { w: 'лиса', e: '🦊' },
  { w: 'вода', e: '💧' },
  { w: 'огонь', e: '🔥' },
  { w: 'книга', e: '📖' },
  { w: 'яблоко', e: '🍎' },
  { w: 'машина', e: '🚗' },
  { w: 'солнце', e: '☀️' },
  { w: 'цветок', e: '🌸' },
  { w: 'собака', e: '🐶' },
  { w: 'кошка', e: '🐈' },
  { w: 'облако', e: '☁️' },
  { w: 'звезда', e: '⭐' },
  { w: 'банан', e: '🍌' }
];

KidsData.wordsByLen = function (minLen, maxLen) {
  var out = [];
  var i, item;
  for (i = 0; i < KidsData.WORDS.length; i++) {
    item = KidsData.WORDS[i];
    if (item.w.length >= minLen && item.w.length <= maxLen) out.push(item);
  }
  return out;
};

KidsData.COMMANDS = [
  { text: 'Нажми на кошку', target: '🐱', distractors: ['🐶', '🐭', '🦊'] },
  { text: 'Нажми на собаку', target: '🐶', distractors: ['🐱', '🐭', '🦊'] },
  { text: 'Выбери яблоко', target: '🍎', distractors: ['🍌', '🍇', '🍊'] },
  { text: 'Выбери банан', target: '🍌', distractors: ['🍎', '🍇', '🍊'] },
  { text: 'Нажми на солнце', target: '☀️', distractors: ['🌙', '⭐', '☁️'] },
  { text: 'Нажми на луну', target: '🌙', distractors: ['☀️', '⭐', '☁️'] },
  { text: 'Выбери машину', target: '🚗', distractors: ['🚌', '🚲', '✈️'] },
  { text: 'Выбери автобус', target: '🚌', distractors: ['🚗', '🚲', '✈️'] },
  { text: 'Нажми на рыбу', target: '🐟', distractors: ['🐦', '🐸', '🐢'] },
  { text: 'Нажми на птицу', target: '🐦', distractors: ['🐟', '🐸', '🐢'] },
  { text: 'Выбери синий круг', target: '🔵', distractors: ['🔴', '🟢', '🟡'] },
  { text: 'Выбери красный круг', target: '🔴', distractors: ['🔵', '🟢', '🟡'] },
  { text: 'Нажми на дом', target: '🏠', distractors: ['🏫', '🏥', '🏰'] },
  { text: 'Выбери книгу', target: '📖', distractors: ['✏️', '🎒', '📐'] }
];
