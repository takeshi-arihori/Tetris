'use strict';

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Initial Screen ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

// initialPageとmainPageを取得
let initial_screen = document.getElementById("initial-screen");
let main_screen = document.getElementById("main-screen");



/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Main Screen ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


// ========================== field ===========================
// 1ブロックのサイズ
const BLOCK_SIZE = 25;

// テトロミノのサイズ
const TETRO_SIZE = 4;

// canvasのサイズ基準
const FIELD_COL = 10;
const FIELD_ROW = 20;

// テトロミノのブロックサイズを掛け合わせてフィールドの大きさを定義
const SCREEN_W = BLOCK_SIZE * FIELD_COL;
const SCREEN_H = BLOCK_SIZE * FIELD_ROW;

// フィールド ({FIELD_COL * FIELD_ROW} を格納する配列)
let field = [];

// ===================== キャンバスAPI ========================

// キャンバスAPIを取得
let canvas = document.getElementById('canvas');

// フィールドを描画
let context = canvas.getContext('2d');

// canvasの大きさとborderを定義
canvas.width = SCREEN_W;
canvas.height = SCREEN_H;
canvas.style.border = "3px solid #555";




// ======================== テトロミノ ========================

// テトロミノ
let tetro;

// テトロミノのtype
let tetro_t;

// テトロミノネクスト
let tetro_n;

// テトロミノの落下地点を定義
const START_X = FIELD_COL / 2 - TETRO_SIZE / 2;
const START_Y = 0;

// テトロミノの現在地を代入
let tetro_x = START_X;
let tetro_y = START_Y;

// setInterval
let interval;

// Game Over判定
let over = false;



// ======================== Game play ========================

// Game Speed
let game_speed = 800;

// Level
let level = 1;

// スコア
let scoreCount = 0;

// 消したライン数
let deleteLine = 0;

// scoreList(消した列により得点が変動する)
// level * 列のScore -> TotalScore
const scoreList = {
  1: 40, // 1列 : 40 Score
  2: 100, // 2列 : 100 Score
  3: 300, // 3列 : 250 Score
  4: 1000, // 4列 : 700 Score
}


// テトロミノの色
const TETRO_COLORS = [
  "#000",
  "#6cf",
  "#fb2",
  "#66f",
  "#c5c",
  "#fd2",
  "#f44",
  "#6b6",
];


// テトロミノのType
const TETRO_TYPES = [
  [],
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
  ],
]


/* =========================== Score Display ======================= */

const screenTransition = () => {
  let scoreBoardLevel = document.getElementById("level");
  let scoreBoardCount = document.getElementById("score-count");
  let scoreBoardLine = document.getElementById("line-count");

  scoreBoardLevel.innerHTML = `LEVEL : ${level}`;
  scoreBoardCount.innerHTML = `SCORE : ${scoreCount}`;
  scoreBoardLine.innerHTML = `DELETE LINE : ${deleteLine}`;


  const BASE_LEVEL = 2000; // このレベルを基準にlevel-up(game_speed)がupする
  let currentLevel = level * BASE_LEVEL; // 現状のレベル

  // スコアが一定の点数に到達するとlevel-upする
  if ((scoreCount >= currentLevel) && (game_speed !== 100)) {
    alert("LEVEL UP!!!")
    level++;
    game_speed -= 100;
  }
}


// ========================= game start ===========================

// d-blockをd-noneに変更
function displayNone(ele) {
  ele.style.display = "block";
  ele.style.display = "none";
}

// d-noneをd-blockに変更
function displayBlock(ele) {
  ele.style.display = "none";
  ele.style.display = "block";
}

/* gameStart()クリック時にinitial-pageとmain-pageを入れ替える */
document.getElementById("gameStart").addEventListener('click', () => {

  displayNone(initial_screen);
  displayBlock(main_screen);
  console.log("clickstarttttt")

  init();
  dropTetro();
}, false);



/* ========================= setInterval ============================ */

// intervalをclear
function onClearInterval() {
  clearInterval(interval);
}

// intervalをset
function onSetInterval() {
  interval = setInterval(dropTetro, game_speed);
}


let btn = document.getElementById("onStopBtn");

// ReStart・Pause
const onStopButton = () => {

  // classList内にpauseがあればstopする
  if (btn.classList.contains("pause")) {
    onClearInterval();
    btn.classList.remove("pause");
    btn.classList.add("restart");
    btn.innerHTML = "RESTART";
  } else {
    onSetInterval();
    btn.classList.remove("restart");
    btn.classList.add("pause");
    btn.innerHTML = "PAUSE";
  }
}


/* ================================ ReStart ============================== */

const resetButton = () => {
  // pauseしていなければ一旦pauseする
  if (btn.classList.contains("pause")) {
    onClearInterval();
  }

  let res = confirm("本当に中断しますか？？");
  if (res) {
    displayBlock(initial_screen);
    displayNone(main_screen);
  } else {
    onSetInterval();
  }
}



/* ================================ 初期化 ==================================== */

function init() {
  // フィールドをクリア
  for (let y = 0; y < FIELD_ROW; y++) {
    field[y] = [];
    for (let x = 0; x < FIELD_COL; x++) {
      field[y][x] = 0;
    }
  }

  // 最初のテトロのためネクスト入れる
  tetro_n = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;

  setTetro();
  drawAll();
  interval = setInterval(dropTetro, game_speed);
}

/* ============================= Next Tetro ============================ */

function setTetro() {
  // ネクストを現在のテトロにする
  tetro_t = tetro_n;
  tetro = TETRO_TYPES[tetro_t];
  tetro_n = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;

  tetro_x = START_X;
  tetro_y = START_Y;
}


function drawBlock(x, y, c) {
  // ブロックサイズを代入
  let px = x * BLOCK_SIZE;
  let py = y * BLOCK_SIZE;

  context.fillStyle = TETRO_COLORS[c];
  context.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);

  context.strokeStyle = "white";
  context.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}

// 全てを描画
function drawAll() {

  // フィールドをクリアにする
  context.clearRect(0, 0, SCREEN_W, SCREEN_H);

  for (let y = 0; y < FIELD_ROW; y++) {
    for (let x = 0; x < FIELD_COL; x++) {
      if (field[y][x]) {
        drawBlock(x, y, field[y][x]);
      }
    }
  }

  // 着地点の計算
  let plus = 0;
  while (checkMove(0, plus + 1)) plus++;

  // テトロミノを描画
  for (let y = 0; y < TETRO_SIZE; y++) {
    for (let x = 0; x < TETRO_SIZE; x++) {
      if (tetro[y][x]) {
        // 着地点
        drawBlock(tetro_x + x, tetro_y + y + plus, 0);
        // 本体
        drawBlock(tetro_x + x, tetro_y + y, tetro_t);
      }

      // Next tetro
      if (TETRO_TYPES[tetro_n][y][x]) {
        drawBlock(13 + x, 4 + y, tetro_n);
      }
    }
  }

  // Game over時の設定
  if (over) {
    let s = "GAME OVER";
    context.font = "50px 'MSゴシック'";
    let w = context.measureText(s).width;
    let x = SCREEN_W / 2 - w / 2;
    let y = SCREEN_H / 2 - 20;
    context.lineWidth = 4;
    context.strokeText(s, x, y);
    context.fillStyle = "white";
    context.fillText(s, x, y);

  }

}


// ブロック衝突判定
function checkMove(mx, my, newTetro) {

  if (newTetro === undefined) newTetro = tetro;

  for (let y = 0; y < TETRO_SIZE; y++) {
    for (let x = 0; x < TETRO_SIZE; x++) {
      let nx = tetro_x + mx + x;
      let ny = tetro_y + my + y;

      if (newTetro[y][x]) {
        // テトロミノのフィールドスペースを制限
        if (
          ny < 0 ||
          nx < 0 ||
          ny >= FIELD_ROW ||
          nx >= FIELD_COL ||
          field[ny][nx]
        ) {
          return false
        };
      }
    }
  }
  return true;
}

// テトロミノ回転
function rotate() {
  let ntetro = [];
  for (let y = 0; y < TETRO_SIZE; y++) {
    ntetro[y] = [];
    for (let x = 0; x < TETRO_SIZE; x++) {
      ntetro[y][x] = tetro[TETRO_SIZE - x - 1][y];
    }
  }
  return ntetro;
}

// 最下部に到達時点でテトロミノ固定
function fixTetro() {
  for (let y = 0; y < TETRO_SIZE; y++) {
    for (let x = 0; x < TETRO_SIZE; x++) {
      if (tetro[y][x]) {
        field[tetro_y + y][tetro_x + x] = tetro_t;
      }
    }
  }
}


// ラインが揃ったかチェックして消す
function checkLine() {
  // ラインを消した数をカウント(スコアの計算)
  let lineCount = 0;
  // 全てのラインを上からチェック
  for (let y = 0; y < FIELD_ROW; y++) {
    let flag = true;
    for (let x = 0; x < FIELD_COL; x++) {
      // 0があればfalse(揃ってないということなので即loopを抜ける)
      if (!field[y][x]) {
        flag = false;
        break;
      }
    }

    // 全てtrye(ラインが揃ってるなら)
    if (flag) {
      // ラインを消した数
      lineCount++;

      // ラインを消す作業(ラインのブロックを一段下げる処理)
      for (let ny = y; ny > 0; ny--) {
        for (let nx = 0; nx < FIELD_COL; nx++) {
          // 上の行からlineを持ってくる
          field[ny][nx] = field[ny - 1][nx];
        }
      }
    }
  }

  if (lineCount) {
    // lineを消した数をcount
    deleteLine += lineCount;
    scoreCount += scoreList[lineCount] * level;
    // displayの更新
    screenTransition();
  }
}



// テトロミノの落下処理
function dropTetro() {

  if (over) return;

  if (checkMove(0, 1)) tetro_y++;
  else {
    // 一番下の行にテトロミノが付いた時点でその場に固定
    fixTetro();

    // テトロミノのラインが揃ったかチェック
    checkLine();

    // 次のテトロミノの準備
    setTetro();

    if (!checkMove(0, 0)) over = true;
  }

  drawAll();
}


document.onkeydown = (e) => {
  // overフラグが立っていたなら即return
  if (over) return;

  switch (e.key) {
    case "ArrowLeft":
      if (checkMove(-1, 0)) tetro_x--;
      break;
    case "ArrowRight":
      if (checkMove(1, 0)) tetro_x++;
      break;
    case "ArrowUp":
      // ↑キーは一番下までブロックが一瞬で移動するようにする
      while (checkMove(0, 1)) tetro_y++;
      break;
    case "ArrowDown":
      if (checkMove(0, 1)) tetro_y++;
      break;
    case "Shift":
      break;
    case " ":
      let newTetro = rotate();
      // 回転できるかチェック
      if (checkMove(0, 0, newTetro)) tetro = newTetro;
      break;
    case "Enter":
      break;
  }
  // 処理後にもう一度全体を表示
  drawAll();
};