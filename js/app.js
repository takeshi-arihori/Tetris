'use strict';

// テトロミノの落ちるスピード
let game_speed = 800;

// ゲームスピード設定 <<<<<<<<<<<<<<-------------------------
let speed = 700;

// フィールドサイズ
const FIELD_COL = 10;
const FIELD_ROW = 20;

// ブロック一つのサイズ(px)
const BLOCK_SIZE = 30;

// キャンバスサイズ (W300 * H600 のスクリーンサイズ)
const SCREEN_W = BLOCK_SIZE * FIELD_COL;
const SCREEN_H = BLOCK_SIZE * FIELD_ROW;

// テトロミノのサイズ
const TETRO_SIZE = 4;

// 背景色の変更
// document.body.style.background = url('/img/mountain-fantasy.jpg');

// キャンバスAPIを取得
let can = document.getElementById("can");
let con = can.getContext("2d")

can.width = SCREEN_W;
can.height = SCREEN_H;
can.style.border = "4px solid #555"; // fieldの線

// 各テトロミノの色
const TETRO_COLORS = [
  "#000",               // 空
  "#6CF",               // 水色
  "#F92",               // オレンジ
  "#66F",               // 青
  "#C5C",               // 紫
  "#FD2",               // 黄色
  "#F44",               // 赤
  "#5B5",               // 緑
  "#ade8f4",            // 黒
]


// テトロミノの種類
const TETRO_TYPES = [
  [],             // 0. 空

  [               // 1. I
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  [               // 2. L
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]
  ],
  [               // 3. J
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]
  ],
  [               // 4. T
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0]
  ],
  [               // 5. O
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]
  ],
  [               // 6. Z
    [0, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]
  ],
  [               // 7. S
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0]
  ],
  [               // 8. ..
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 1, 1, 0]
  ],
];

// 画像 <<<<<<<<<<<<<<<<<<<<<-------------------------
let bgImage;
bgImage = new Image();
bgImage.src = "/img/starry-sky-2675322_1280 (1).jpg" // ここにimage追加

let blImage;
blImage = new Image();
blImage.src = "/img/mountain-fantasy.jpg"; // ここにimage追加

// 効果音 <<<<<<<<<<<<<<<<<-----------------------------

const MUSIC = new Audio("/music/Tetris-Theme-Tetris-Soundtrack (1).mp3");
const ROTATE_SOUND = new Audio("/music/ブロックを90度回した時の音.mp3");
const STACK_SOUND = new Audio("/music/下キーを押した時の音.mp3");
const DELETE_SOUND = new Audio("/music/ブロックが消える時の音.mp3");
const GAME_OVER = new Audio("/music/Game Over時の音.mp3")

// テトロミノの落下スタート地点
const START_X = FIELD_COL / 2 - TETRO_SIZE / 2;
const START_Y = 0;

// チェック用
console.log("START_X(tetro_x) : " + START_X)
console.log("START_Y(tetro_y) : " + START_Y)
console.log("FIELD_COLUMN : " + FIELD_COL)
console.log("FIELD_ROW : " + FIELD_ROW)
console.log("TETRO_SIZE : " + TETRO_SIZE)

// テトロミノ本体
let tetro;

// テトロミノの座標
let tetro_x = START_X;
let tetro_y = START_Y;

// テトロミノの形
let tetro_type;

// テトロミノネクスト
let tetro_next;

// フィールドの中身
let field = [];

// GAME OVERフラグ
let over = false;

// 消したライン数
let lines = 0;

// スコア
let score = 0;

// ゲームフィールドの位置
const OFFSET_X = 0;
const OFFSET_Y = 0;


// initializeでスタート
init();

let body = document.getElementById("body");


// 初期化
function init() {
  // フィールドのクリア
  for (let y = 0; y < FIELD_ROW; y++) {
    field[y] = [];
    for (let x = 0; x < FIELD_COL; x++) {
      field[y][x] = 0;
    }
  }
  // 最初のテトロのためネクスト入れる
  tetro_next = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;

  // テトロをセットして描画開始
  MUSIC.play();
  setTetro();
  drawAll();
  setInterval(dropTetro, game_speed - speed);

}


// テトロをネクストで初期化
function setTetro() {
  // ネクストを現在のテトロにする
  tetro_type = tetro_next;
  tetro = TETRO_TYPES[tetro_type];
  tetro_next = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;

  tetro_x = START_X;
  tetro_y = START_Y;
}

// ブロック一つを描画
function drawBlock(x, y, c) {

  let px = x * BLOCK_SIZE;
  let py = y * BLOCK_SIZE;

  // テトロミノを画像にする場合ここで処理を書く <<<<<<<<<<------------

  con.fillStyle = TETRO_COLORS[c];
  con.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
  con.strokeStyle = "white";
  con.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE)
}


// 全てを描画
function drawAll() {
  // con.clearRect(0, 0, SCREEN_W, SCREEN_H); // フィールドを表示する前にクリア/

  // 背景を描画
  con.drawImage(bgImage, -800, 0);

  // フィールドを描画
  for (let y = 0; y < FIELD_ROW; y++) {
    for (let x = 0; x < FIELD_COL; x++) {
      if (field[y][x]) {
        drawBlock(x, y, field[y][x]);
      }
    }
  }

  // 着地点を計算
  let plus = 0;
  while (checkMove(0, plus + 1)) plus++;

  // ブロック一つを描画
  for (let y = 0; y < TETRO_SIZE; y++) {
    for (let x = 0; x < TETRO_SIZE; x++) {
      if (tetro[y][x]) {
        // 着地点
        drawBlock(tetro_x + x, tetro_y + y + plus, 0);
        // 本体
        drawBlock(tetro_x + x, tetro_y + y, tetro_type);
      }

      // ネクストテトロ
      if (TETRO_TYPES[tetro_next][y][x]) {
        drawBlock(13 + x, 4 + y, tetro_next);
      }
    }
  }

  // GAME OVERの時に画面にGAME OVERと表示
  if (over) {
    let s = "GAME OVER";
    GAME_OVER.play();
    MUSIC.pause();
    con.font = "40px 'MS ゴシック'";
    let w = con.measureText(s).width;
    let x = SCREEN_W / 2 - w / 2;
    let y = SCREEN_H / 2 - 20;
    con.lineWidth = 4;
    con.strokeText(s, x, y);
    con.fillStyle = "white";
    con.fillText(s, x, y);
  }
}

// ブロックの衝突判定
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

// テトロミノの回転
function rotate() {
  let newTetro = [];

  for (let y = 0; y < TETRO_SIZE; y++) {
    newTetro[y] = [];
    for (let x = 0; x < TETRO_SIZE; x++) {
      newTetro[y][x] = tetro[TETRO_SIZE - x - 1][y];
    }
  }
  return newTetro;
}

// 衝突時はテトロミノを固定
function fixTetro() {
  for (let y = 0; y < TETRO_SIZE; y++) {
    for (let x = 0; x < TETRO_SIZE; x++) {
      if (tetro[y][x]) {
        field[tetro_y + y][tetro_x + x] = tetro_type;
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
    DELETE_SOUND.pause();
    DELETE_SOUND.play();
    lines += lineCount;
    score += 100 * (2 ** (lineCount - 1));

    if (speed < game_speed - 10) speed += 10;
  }
}

// テトロミノの落下処理
function dropTetro() {
  // overフラグが立っていたなら即return
  if (over) return;

  if (checkMove(0, 1)) tetro_y++;
  // テトロミノが衝突した時の処理
  else {
    fixTetro();
    // テトロミノのラインが揃ったかチェック
    checkLine();
    // 次のテトロミノの処理
    setTetro();

    // フィールドが埋まったらGAME OVER
    if (!checkMove(0, 0)) {
      over = true;
    }
  }
  drawAll();
}

// キーボードが押された時の処理
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
    case "ArrowDown":
      while (checkMove(0, 1)) tetro_y++;
      break;
    case " ":
      let newTetro = rotate();
      // 回転できるかチェック
      if (checkMove(0, 0, newTetro)) {
        tetro = newTetro;
        ROTATE_SOUND.play();
      }
      break;
    case "Enter":
      break;
  }
  // 処理後にもう一度全体を表示
  drawAll();
};

