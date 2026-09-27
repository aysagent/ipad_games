(function () {
  'use strict';
  var K = Kids;
  var foundMap = {};
  var need = 3;

  var levels = K.createLevelController({
    gameId: 'otlichiya',
    needed: 1,
    onLevelChange: function () { buildScenes(); }
  });

  function diffCount(level) {
    if (level === 1) return 3;
    if (level === 2) return 4;
    return 5;
  }

  var baseItems = [
    { x: 20, y: 30, s: 36, e: '🏠' },
    { x: 110, y: 40, s: 34, e: '🌳' },
    { x: 200, y: 35, s: 32, e: '☀️' },
    { x: 40, y: 120, s: 30, e: '🐶' },
    { x: 150, y: 130, s: 28, e: '🌸' },
    { x: 220, y: 110, s: 30, e: '🐦' }
  ];

  var altItems = ['🏫', '🌲', '🌙', '🐱', '🌺', '🦋'];

  function buildScenes() {
    need = diffCount(levels.getLevel());
    foundMap = {};
    var indices = K.sample([0, 1, 2, 3, 4, 5], need);
    K.$('prompt').textContent = 'Найди отличия: 0 / ' + need;

    var a = K.$('scene-a');
    var b = K.$('scene-b');
    a.innerHTML = '';
    b.innerHTML = '';

    var i;
    for (i = 0; i < baseItems.length; i++) {
      var isDiff = indices.indexOf(i) !== -1;
      place(a, baseItems[i], isDiff, i);
      place(b, {
        x: baseItems[i].x,
        y: baseItems[i].y,
        s: baseItems[i].s,
        e: isDiff ? altItems[i] : baseItems[i].e
      }, isDiff, i);
    }
  }

  function foundCount() {
    var n = 0, k;
    for (k in foundMap) {
      if (foundMap.hasOwnProperty(k) && foundMap[k]) n += 1;
    }
    return n;
  }

  function markFound(idx) {
    if (foundMap[idx]) return;
    foundMap[idx] = true;
    var hits = document.querySelectorAll('.diff-hit[data-idx="' + idx + '"]');
    var i;
    for (i = 0; i < hits.length; i++) {
      hits[i].className = 'diff-hit is-found';
    }
    var n = foundCount();
    K.$('prompt').textContent = 'Найди отличия: ' + n + ' / ' + need;
    K.showFeedback('Нашёл!', true);
    if (n >= need) levels.success();
  }

  function place(scene, item, isDiff, idx) {
    var el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.left = item.x + 'px';
    el.style.top = item.y + 'px';
    el.style.fontSize = item.s + 'px';
    el.style.lineHeight = '1';
    el.style.zIndex = '2';
    el.textContent = item.e;
    if (isDiff) {
      var hit = document.createElement('div');
      hit.className = 'diff-hit';
      hit.style.left = (item.x - 8) + 'px';
      hit.style.top = (item.y - 8) + 'px';
      hit.style.width = (item.s + 16) + 'px';
      hit.style.height = (item.s + 16) + 'px';
      hit.style.zIndex = '3';
      hit.setAttribute('data-idx', String(idx));
      hit.onclick = function () { markFound(idx); };
      scene.appendChild(hit);
    }
    scene.appendChild(el);
  }

  buildScenes();
})();
