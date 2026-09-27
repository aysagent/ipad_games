(function () {
  'use strict';
  var K = Kids;
  var BOARD = 300;
  var pieces = [];
  var placed = 0;
  var drag = null;
  var pictureUrl = '';
  var pieceSize = 0;
  var gridN = 3;
  var trayCols = 4;

  var levels = K.createLevelController({
    gameId: 'pazl',
    maxLevels: 4,
    needed: 1,
    levelLabels: ['3×3', '4×4', '5×5', '6×6'],
    onLevelChange: function () { buildPuzzle(); }
  });

  function gridSize(level) {
    if (level === 1) return 3;
    if (level === 2) return 4;
    if (level === 3) return 5;
    return 6;
  }

  var SCENES = [
    { kind: 'house', title: 'Домик' },
    { kind: 'sea', title: 'Море' },
    { kind: 'space', title: 'Космос' },
    { kind: 'park', title: 'Парк' },
    { kind: 'farm', title: 'Ферма' },
    { kind: 'city', title: 'Город' },
    { kind: 'rainbow', title: 'Радуга' },
    { kind: 'winter', title: 'Зима' },
    { kind: 'beach', title: 'Пляж' },
    { kind: 'castle', title: 'Замок' }
  ];

  function oval(ctx, cx, cy, rx, ry, fill) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rx / 10, ry / 10);
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    if (fill) ctx.fill();
    else ctx.stroke();
    ctx.restore();
  }

  function drawScene(ctx, w, h, kind) {
    var i;

    if (kind === 'house') {
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#5CB85C';
      ctx.fillRect(0, h * 0.62, w, h * 0.38);
      ctx.fillStyle = '#F4D03F';
      ctx.beginPath();
      ctx.arc(w * 0.82, h * 0.18, w * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#E8A87C';
      ctx.fillRect(w * 0.22, h * 0.38, w * 0.36, h * 0.32);
      ctx.fillStyle = '#C0392B';
      ctx.beginPath();
      ctx.moveTo(w * 0.18, h * 0.38);
      ctx.lineTo(w * 0.4, h * 0.22);
      ctx.lineTo(w * 0.62, h * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#6D4C41';
      ctx.fillRect(w * 0.34, h * 0.52, w * 0.1, h * 0.18);
      ctx.fillStyle = '#AED6F1';
      ctx.fillRect(w * 0.45, h * 0.45, w * 0.08, h * 0.08);
      ctx.fillStyle = '#8B5A2B';
      ctx.fillRect(w * 0.72, h * 0.48, w * 0.05, h * 0.22);
      ctx.fillStyle = '#27AE60';
      ctx.beginPath();
      ctx.arc(w * 0.745, h * 0.44, w * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#E91E63';
      ctx.beginPath();
      ctx.arc(w * 0.12, h * 0.72, w * 0.035, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'sea') {
      ctx.fillStyle = '#5DADE2';
      ctx.fillRect(0, 0, w, h * 0.35);
      ctx.fillStyle = '#2E86C1';
      ctx.fillRect(0, h * 0.35, w, h * 0.65);
      ctx.fillStyle = '#F7DC6F';
      ctx.beginPath();
      ctx.arc(w * 0.2, h * 0.15, w * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#E67E22';
      oval(ctx, w * 0.45, h * 0.55, w * 0.12, h * 0.07, true);
      ctx.beginPath();
      ctx.moveTo(w * 0.55, h * 0.55);
      ctx.lineTo(w * 0.68, h * 0.48);
      ctx.lineTo(w * 0.68, h * 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(w * 0.4, h * 0.53, w * 0.015, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1E8449';
      ctx.lineWidth = Math.max(4, w * 0.02);
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.95);
      ctx.quadraticCurveTo(w * 0.2, h * 0.7, w * 0.12, h * 0.55);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.85, h * 0.95);
      ctx.quadraticCurveTo(w * 0.8, h * 0.7, w * 0.88, h * 0.5);
      ctx.stroke();
    } else if (kind === 'space') {
      ctx.fillStyle = '#1A237E';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#FFF59D';
      for (i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc((i * 73) % w, (i * 97) % h, 1.5 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#EF5350';
      ctx.beginPath();
      ctx.arc(w * 0.35, h * 0.45, w * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFCC80';
      ctx.lineWidth = Math.max(3, w * 0.015);
      oval(ctx, w * 0.35, h * 0.45, w * 0.22, h * 0.05, false);
      ctx.fillStyle = '#ECEFF1';
      ctx.fillRect(w * 0.68, h * 0.55, w * 0.08, h * 0.18);
      ctx.fillStyle = '#42A5F5';
      ctx.beginPath();
      ctx.moveTo(w * 0.68, h * 0.55);
      ctx.lineTo(w * 0.72, h * 0.45);
      ctx.lineTo(w * 0.76, h * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FF7043';
      ctx.beginPath();
      ctx.moveTo(w * 0.68, h * 0.73);
      ctx.lineTo(w * 0.72, h * 0.82);
      ctx.lineTo(w * 0.76, h * 0.73);
      ctx.closePath();
      ctx.fill();
    } else if (kind === 'park') {
      ctx.fillStyle = '#81D4FA';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#66BB6A';
      ctx.fillRect(0, h * 0.55, w, h * 0.45);
      ctx.fillStyle = '#FFF176';
      ctx.beginPath();
      ctx.arc(w * 0.15, h * 0.18, w * 0.08, 0, Math.PI * 2);
      ctx.fill();
      // горка
      ctx.fillStyle = '#42A5F5';
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.75);
      ctx.lineTo(w * 0.45, h * 0.35);
      ctx.lineTo(w * 0.48, h * 0.75);
      ctx.closePath();
      ctx.fill();
      // качели
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.65, h * 0.35);
      ctx.lineTo(w * 0.65, h * 0.7);
      ctx.moveTo(w * 0.85, h * 0.35);
      ctx.lineTo(w * 0.85, h * 0.7);
      ctx.moveTo(w * 0.62, h * 0.35);
      ctx.lineTo(w * 0.88, h * 0.35);
      ctx.stroke();
      ctx.fillStyle = '#EF5350';
      ctx.fillRect(w * 0.68, h * 0.62, w * 0.14, h * 0.04);
      // дерево
      ctx.fillStyle = '#6D4C41';
      ctx.fillRect(w * 0.08, h * 0.45, w * 0.04, h * 0.2);
      ctx.fillStyle = '#43A047';
      ctx.beginPath();
      ctx.arc(w * 0.1, h * 0.42, w * 0.08, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'farm') {
      ctx.fillStyle = '#81D4FA';
      ctx.fillRect(0, 0, w, h * 0.55);
      ctx.fillStyle = '#A5D6A7';
      ctx.fillRect(0, h * 0.55, w, h * 0.45);
      ctx.fillStyle = '#FFEE58';
      ctx.beginPath();
      ctx.arc(w * 0.85, h * 0.15, w * 0.08, 0, Math.PI * 2);
      ctx.fill();
      // амбар
      ctx.fillStyle = '#E53935';
      ctx.fillRect(w * 0.15, h * 0.35, w * 0.35, h * 0.3);
      ctx.fillStyle = '#B71C1C';
      ctx.beginPath();
      ctx.moveTo(w * 0.12, h * 0.35);
      ctx.lineTo(w * 0.325, h * 0.2);
      ctx.lineTo(w * 0.53, h * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FFE082';
      ctx.fillRect(w * 0.28, h * 0.48, w * 0.1, h * 0.17);
      // корова
      ctx.fillStyle = '#FAFAFA';
      oval(ctx, w * 0.7, h * 0.7, w * 0.12, h * 0.08, true);
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(w * 0.66, h * 0.68, w * 0.02, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.74, h * 0.72, w * 0.025, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FAFAFA';
      ctx.beginPath();
      ctx.arc(w * 0.6, h * 0.68, w * 0.04, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'city') {
      ctx.fillStyle = '#90CAF9';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#78909C';
      ctx.fillRect(0, h * 0.75, w, h * 0.25);
      ctx.fillStyle = '#5C6BC0';
      ctx.fillRect(w * 0.08, h * 0.25, w * 0.2, h * 0.5);
      ctx.fillStyle = '#26A69A';
      ctx.fillRect(w * 0.35, h * 0.35, w * 0.18, h * 0.4);
      ctx.fillStyle = '#EF5350';
      ctx.fillRect(w * 0.6, h * 0.2, w * 0.28, h * 0.55);
      ctx.fillStyle = '#FFF59D';
      for (i = 0; i < 12; i++) {
        ctx.fillRect(w * 0.12 + (i % 3) * w * 0.05, h * 0.3 + Math.floor(i / 3) * h * 0.1, w * 0.03, h * 0.04);
      }
      for (i = 0; i < 8; i++) {
        ctx.fillRect(w * 0.65 + (i % 2) * w * 0.1, h * 0.28 + Math.floor(i / 2) * h * 0.1, w * 0.05, h * 0.05);
      }
      // машинка
      ctx.fillStyle = '#FFCA28';
      ctx.fillRect(w * 0.2, h * 0.78, w * 0.22, h * 0.08);
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(w * 0.26, h * 0.88, w * 0.03, 0, Math.PI * 2);
      ctx.arc(w * 0.38, h * 0.88, w * 0.03, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'rainbow') {
      ctx.fillStyle = '#BBDEFB';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#81C784';
      ctx.fillRect(0, h * 0.7, w, h * 0.3);
      var colors = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#1E88E5', '#8E24AA'];
      for (i = 0; i < colors.length; i++) {
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = w * 0.035;
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.75, w * 0.42 - i * w * 0.035, Math.PI, 0, false);
        ctx.stroke();
      }
      ctx.fillStyle = '#FFF176';
      ctx.beginPath();
      ctx.arc(w * 0.15, h * 0.2, w * 0.07, 0, Math.PI * 2);
      ctx.fill();
      // облака
      ctx.fillStyle = '#fff';
      oval(ctx, w * 0.75, h * 0.25, w * 0.1, h * 0.05, true);
      oval(ctx, w * 0.82, h * 0.25, w * 0.08, h * 0.045, true);
    } else if (kind === 'winter') {
      ctx.fillStyle = '#90CAF9';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#E3F2FD';
      ctx.fillRect(0, h * 0.65, w, h * 0.35);
      ctx.fillStyle = '#fff';
      for (i = 0; i < 35; i++) {
        ctx.beginPath();
        ctx.arc((i * 53) % w, (i * 79) % (h * 0.65), 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      // снеговик
      ctx.beginPath();
      ctx.arc(w * 0.35, h * 0.72, w * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.35, h * 0.55, w * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.35, h * 0.42, w * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF7043';
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.42);
      ctx.lineTo(w * 0.48, h * 0.44);
      ctx.lineTo(w * 0.35, h * 0.46);
      ctx.closePath();
      ctx.fill();
      // ёлка
      ctx.fillStyle = '#2E7D32';
      ctx.beginPath();
      ctx.moveTo(w * 0.7, h * 0.35);
      ctx.lineTo(w * 0.85, h * 0.55);
      ctx.lineTo(w * 0.55, h * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 0.7, h * 0.45);
      ctx.lineTo(w * 0.9, h * 0.7);
      ctx.lineTo(w * 0.5, h * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(w * 0.67, h * 0.7, w * 0.06, h * 0.08);
    } else if (kind === 'beach') {
      ctx.fillStyle = '#4FC3F7';
      ctx.fillRect(0, 0, w, h * 0.45);
      ctx.fillStyle = '#29B6F6';
      ctx.fillRect(0, h * 0.45, w, h * 0.2);
      ctx.fillStyle = '#FFE082';
      ctx.fillRect(0, h * 0.65, w, h * 0.35);
      ctx.fillStyle = '#FFEE58';
      ctx.beginPath();
      ctx.arc(w * 0.8, h * 0.15, w * 0.09, 0, Math.PI * 2);
      ctx.fill();
      // зонт
      ctx.fillStyle = '#EF5350';
      ctx.beginPath();
      ctx.arc(w * 0.35, h * 0.55, w * 0.14, Math.PI, 0, false);
      ctx.fill();
      ctx.strokeStyle = '#6D4C41';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.55);
      ctx.lineTo(w * 0.35, h * 0.78);
      ctx.stroke();
      // ведёрко
      ctx.fillStyle = '#42A5F5';
      ctx.fillRect(w * 0.65, h * 0.72, w * 0.1, h * 0.1);
      ctx.fillStyle = '#FFCA28';
      ctx.fillRect(w * 0.78, h * 0.78, w * 0.08, h * 0.03);
    } else if (kind === 'castle') {
      ctx.fillStyle = '#81D4FA';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#81C784';
      ctx.fillRect(0, h * 0.7, w, h * 0.3);
      ctx.fillStyle = '#B0BEC5';
      ctx.fillRect(w * 0.2, h * 0.35, w * 0.6, h * 0.4);
      ctx.fillRect(w * 0.15, h * 0.25, w * 0.15, h * 0.5);
      ctx.fillRect(w * 0.7, h * 0.25, w * 0.15, h * 0.5);
      ctx.fillStyle = '#78909C';
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.25);
      ctx.lineTo(w * 0.225, h * 0.12);
      ctx.lineTo(w * 0.3, h * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 0.7, h * 0.25);
      ctx.lineTo(w * 0.775, h * 0.12);
      ctx.lineTo(w * 0.85, h * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(w * 0.42, h * 0.52, w * 0.16, h * 0.23);
      ctx.fillStyle = '#FFE082';
      ctx.fillRect(w * 0.18, h * 0.4, w * 0.06, h * 0.06);
      ctx.fillRect(w * 0.76, h * 0.4, w * 0.06, h * 0.06);
      ctx.fillStyle = '#EF5350';
      ctx.fillRect(w * 0.76, h * 0.08, w * 0.03, h * 0.08);
      ctx.beginPath();
      ctx.moveTo(w * 0.775, h * 0.08);
      ctx.lineTo(w * 0.85, h * 0.11);
      ctx.lineTo(w * 0.775, h * 0.14);
      ctx.closePath();
      ctx.fill();
    } else {
      // fallback
      ctx.fillStyle = '#CE93D8';
      ctx.fillRect(0, 0, w, h);
    }
  }

  function makePicture(kind) {
    var c = document.createElement('canvas');
    c.width = BOARD;
    c.height = BOARD;
    var ctx = c.getContext('2d');
    drawScene(ctx, BOARD, BOARD, kind);
    return c.toDataURL('image/png');
  }

  function buildPuzzle() {
    var level = levels.getLevel();
    var meta = K.pick(SCENES);
    gridN = gridSize(level);
    pieceSize = BOARD / gridN;
    pictureUrl = makePicture(meta.kind);
    placed = 0;
    pieces = [];
    drag = null;

    var mini = Math.max(28, Math.floor(pieceSize * 0.48));
    trayCols = Math.max(3, Math.floor(280 / (mini + 6)));

    K.$('scene-name').textContent = meta.title + ' · ' + gridN + '×' + gridN;
    K.$('prompt').textContent = 'Перетащи кусочки на картинку';

    var board = K.$('board');
    var tray = K.$('tray');
    board.innerHTML = '';
    tray.innerHTML = '';
    board.style.width = BOARD + 'px';
    board.style.height = BOARD + 'px';

    var ghost = document.createElement('img');
    ghost.className = 'puzzle-ghost';
    ghost.src = pictureUrl;
    ghost.alt = '';
    board.appendChild(ghost);

    var i, j, idx;
    for (j = 0; j < gridN; j++) {
      for (i = 0; i < gridN; i++) {
        idx = j * gridN + i;
        var slot = document.createElement('div');
        slot.className = 'puzzle-slot';
        slot.style.left = (i * pieceSize) + 'px';
        slot.style.top = (j * pieceSize) + 'px';
        slot.style.width = pieceSize + 'px';
        slot.style.height = pieceSize + 'px';
        slot.setAttribute('data-slot', String(idx));
        board.appendChild(slot);
      }
    }

    var order = [];
    for (i = 0; i < gridN * gridN; i++) order.push(i);
    order = K.shuffle(order);

    var rows = Math.ceil(order.length / trayCols);
    tray.style.height = rows * (mini + 6) + 16 + 'px';

    for (i = 0; i < order.length; i++) {
      idx = order[i];
      var row = Math.floor(idx / gridN);
      var col = idx % gridN;
      var el = document.createElement('div');
      el.className = 'puzzle-piece';
      el.setAttribute('data-idx', String(idx));
      el.style.width = mini + 'px';
      el.style.height = mini + 'px';
      el.style.backgroundImage = 'url(' + pictureUrl + ')';
      el.style.backgroundSize = (BOARD * mini / pieceSize) + 'px ' + (BOARD * mini / pieceSize) + 'px';
      el.style.backgroundPosition =
        (-col * mini) + 'px ' + (-row * mini) + 'px';
      el.style.left = (6 + (i % trayCols) * (mini + 6)) + 'px';
      el.style.top = (6 + Math.floor(i / trayCols) * (mini + 6)) + 'px';
      tray.appendChild(el);

      pieces.push({
        el: el,
        idx: idx,
        row: row,
        col: col,
        targetX: col * pieceSize,
        targetY: row * pieceSize,
        placed: false,
        inTray: true,
        mini: mini
      });
    }
  }

  function pointFromEvent(e) {
    var t = e.touches && e.touches[0]
      ? e.touches[0]
      : e.changedTouches && e.changedTouches[0]
        ? e.changedTouches[0]
        : e;
    return { x: t.clientX, y: t.clientY };
  }

  function enlargeOnBoard(piece, clientRect) {
    var board = K.$('board');
    var boardRect = board.getBoundingClientRect();
    var el = piece.el;
    if (el.parentNode !== board) board.appendChild(el);
    piece.inTray = false;
    el.style.width = pieceSize + 'px';
    el.style.height = pieceSize + 'px';
    el.style.backgroundSize = BOARD + 'px ' + BOARD + 'px';
    el.style.backgroundPosition = (-piece.col * pieceSize) + 'px ' + (-piece.row * pieceSize) + 'px';
    el.style.left = (clientRect.left - boardRect.left) + 'px';
    el.style.top = (clientRect.top - boardRect.top) + 'px';
  }

  function onStart(e) {
    var target = e.target;
    while (target && target !== document.body && (!target.className || String(target.className).indexOf('puzzle-piece') === -1)) {
      target = target.parentNode;
    }
    if (!target || !target.getAttribute) return;
    var idx = parseInt(target.getAttribute('data-idx'), 10);
    var piece = null;
    var i;
    for (i = 0; i < pieces.length; i++) {
      if (pieces[i].idx === idx) {
        piece = pieces[i];
        break;
      }
    }
    if (!piece || piece.placed) return;
    if (e.preventDefault) e.preventDefault();

    var p = pointFromEvent(e);
    var rect = piece.el.getBoundingClientRect();
    enlargeOnBoard(piece, rect);
    drag = {
      piece: piece,
      ox: p.x - rect.left,
      oy: p.y - rect.top
    };
    piece.el.className = 'puzzle-piece is-dragging';
  }

  function onMove(e) {
    if (!drag) return;
    if (e.preventDefault) e.preventDefault();
    var p = pointFromEvent(e);
    var boardRect = K.$('board').getBoundingClientRect();
    var el = drag.piece.el;
    el.style.left = (p.x - boardRect.left - drag.ox) + 'px';
    el.style.top = (p.y - boardRect.top - drag.oy) + 'px';
  }

  function onEnd(e) {
    if (!drag) return;
    if (e.preventDefault) e.preventDefault();
    var piece = drag.piece;
    var el = piece.el;
    var left = parseFloat(el.style.left) || 0;
    var top = parseFloat(el.style.top) || 0;
    var snap = pieceSize * 0.42;
    var dx = left - piece.targetX;
    var dy = top - piece.targetY;

    if (Math.abs(dx) < snap && Math.abs(dy) < snap) {
      el.style.left = piece.targetX + 'px';
      el.style.top = piece.targetY + 'px';
      el.className = 'puzzle-piece is-placed';
      piece.placed = true;
      placed += 1;
      K.showFeedback('Да!', true);
      if (placed >= pieces.length) levels.success();
    } else {
      el.className = 'puzzle-piece';
      var boardRect = K.$('board').getBoundingClientRect();
      var cx = boardRect.left + left + pieceSize / 2;
      var cy = boardRect.top + top + pieceSize / 2;
      if (
        cx < boardRect.left - 20 ||
        cy < boardRect.top - 20 ||
        cx > boardRect.right + 20 ||
        cy > boardRect.bottom + 40
      ) {
        returnToTray(piece);
      }
    }
    drag = null;
  }

  function returnToTray(piece) {
    var tray = K.$('tray');
    var el = piece.el;
    var mini = piece.mini;
    tray.appendChild(el);
    piece.inTray = true;
    el.style.width = mini + 'px';
    el.style.height = mini + 'px';
    el.style.backgroundSize = (BOARD * mini / pieceSize) + 'px ' + (BOARD * mini / pieceSize) + 'px';
    el.style.backgroundPosition = (-piece.col * mini) + 'px ' + (-piece.row * mini) + 'px';
    var free = [];
    var i;
    for (i = 0; i < pieces.length; i++) {
      if (!pieces[i].placed && pieces[i].inTray) free.push(pieces[i]);
    }
    var fi;
    for (fi = 0; fi < free.length; fi++) {
      free[fi].el.style.left = (6 + (fi % trayCols) * (mini + 6)) + 'px';
      free[fi].el.style.top = (6 + Math.floor(fi / trayCols) * (mini + 6)) + 'px';
    }
  }

  var stage = K.$('stage');
  stage.addEventListener('touchstart', onStart, false);
  stage.addEventListener('touchmove', onMove, false);
  stage.addEventListener('touchend', onEnd, false);
  stage.addEventListener('mousedown', onStart, false);
  document.addEventListener('mousemove', onMove, false);
  document.addEventListener('mouseup', onEnd, false);

  buildPuzzle();
})();
