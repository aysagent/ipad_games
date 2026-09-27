(function () {
  'use strict';
  var K = Kids;
  var canvas = K.$('maze');
  var ctx = canvas.getContext('2d');
  var cell = 40;
  var cols = 8;
  var rows = 8;
  var grid = [];
  var path = [];
  var drawing = false;
  var won = false;

  var levels = K.createLevelController({
    gameId: 'labirint',
    needed: 2,
    onLevelChange: function () { newMaze(); }
  });

  function sizeForLevel(level) {
    /* только нечётные размеры — иначе цель может быть недостижима */
    if (level === 1) return 5;
    if (level === 2) return 7;
    return 9;
  }

  function newMaze() {
    cols = sizeForLevel(levels.getLevel());
    rows = cols;
    cell = Math.floor(320 / cols);
    canvas.width = cols * cell;
    canvas.height = rows * cell;
    grid = generateMaze(cols, rows);
    path = [];
    drawing = false;
    won = false;
    draw();
  }

  function generateMaze(w, h) {
    var g = [];
    var x, y;
    for (y = 0; y < h; y++) {
      g[y] = [];
      for (x = 0; x < w; x++) g[y][x] = 1;
    }
    function carve(cx, cy) {
      var dirs = K.shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      var i, nx, ny;
      g[cy][cx] = 0;
      for (i = 0; i < dirs.length; i++) {
        nx = cx + dirs[i][0] * 2;
        ny = cy + dirs[i][1] * 2;
        if (nx > 0 && ny > 0 && nx < w - 1 && ny < h - 1 && g[ny][nx] === 1) {
          g[cy + dirs[i][1]][cx + dirs[i][0]] = 0;
          carve(nx, ny);
        }
      }
    }
    carve(1, 1);
    g[1][1] = 0;
    g[h - 2][w - 2] = 0;
    // ensure border walls
    for (x = 0; x < w; x++) {
      g[0][x] = 1;
      g[h - 1][x] = 1;
    }
    for (y = 0; y < h; y++) {
      g[y][0] = 1;
      g[y][w - 1] = 1;
    }
    g[1][1] = 0;
    g[h - 2][w - 2] = 0;
    return g;
  }

  function draw() {
    var x, y;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (y = 0; y < rows; y++) {
      for (x = 0; x < cols; x++) {
        ctx.fillStyle = grid[y][x] ? '#3d5c4a' : '#fffaf2';
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    ctx.font = Math.floor(cell * 0.6) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🟢', cell * 1.5, cell * 1.5);
    ctx.fillText('⭐', cell * (cols - 1.5), cell * (rows - 1.5));

    if (path.length > 1) {
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = Math.max(4, cell * 0.2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (x = 1; x < path.length; x++) ctx.lineTo(path[x].x, path[x].y);
      ctx.stroke();
    }
  }

  function posFromEvent(e) {
    var rect = canvas.getBoundingClientRect();
    var touch = e.touches && e.touches[0] ? e.touches[0] : e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e;
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  }

  function cellAt(p) {
    return {
      x: Math.floor(p.x / cell),
      y: Math.floor(p.y / cell)
    };
  }

  function isWall(p) {
    var c = cellAt(p);
    if (c.x < 0 || c.y < 0 || c.x >= cols || c.y >= rows) return true;
    return grid[c.y][c.x] === 1;
  }

  function nearStart(p) {
    var c = cellAt(p);
    return c.x === 1 && c.y === 1;
  }

  function nearGoal(p) {
    var c = cellAt(p);
    return c.x === cols - 2 && c.y === rows - 2;
  }

  function onStart(e) {
    if (won) return;
    e.preventDefault();
    var p = posFromEvent(e);
    if (!nearStart(p)) {
      K.showFeedback('Начни с зелёного', false);
      return;
    }
    drawing = true;
    path = [p];
    draw();
  }

  function onMove(e) {
    if (!drawing || won) return;
    e.preventDefault();
    var p = posFromEvent(e);
    if (isWall(p)) {
      drawing = false;
      path = [];
      draw();
      K.showFeedback('Стена! Снова с начала', false);
      return;
    }
    path.push(p);
    draw();
    if (nearGoal(p)) {
      drawing = false;
      won = true;
      if (!levels.success()) {
        setTimeout(newMaze, 600);
      }
    }
  }

  function onEnd(e) {
    if (!drawing) return;
    drawing = false;
    if (!won) {
      path = [];
      draw();
    }
  }

  canvas.addEventListener('touchstart', onStart, false);
  canvas.addEventListener('touchmove', onMove, false);
  canvas.addEventListener('touchend', onEnd, false);
  canvas.addEventListener('mousedown', onStart, false);
  canvas.addEventListener('mousemove', function (e) {
    if (e.buttons) onMove(e);
  }, false);
  canvas.addEventListener('mouseup', onEnd, false);

  K.$('reset-btn').onclick = function () {
    path = [];
    drawing = false;
    won = false;
    draw();
  };

  newMaze();
})();
