'use strict';

// // ブラウザ上で図を描くためにcanvasを取得
let main_canvas = document.getElementById("main_canvas");
let score_canvas = document.getElementById("score_canvas");
let total_canvas = document.getElementById("total_canvas");
// JavaScriptを使って描画、再描画を繰り返す
let con_main = main_canvas.getContext('2d');
let con_score = score_canvas.getContext('2d');
let con_total = total_canvas.getContext('2d');

const container = document.getElementsByClassName("container");
const btn = document.getElementById("btn");



// テトロミノのブロック1マスのサイズ
const BLOCK_SIZE = 25;

// フィールドの範囲を設定
const FIELD_COL = 10;
const FIELD_ROW = 20;

// スクリーンの幅
const SCREEN_W = BLOCK_SIZE * FIELD_COL;
// スクリーンの高さ
const SCREEN_H = BLOCK_SIZE * FIELD_ROW;

can.width = SCREEN_W;
can.height = SCREEN_H;
can.style.border = "4px solid #555";


// テトロミノの落下位置を調整(落下地点: center)
const START_X = FIELD_COL / 2 - TETRO_SIZE / 2;
const START_Y = 0;


// テトロミノの座標
let tetro_x = START_X;
let tetro_y = START_Y;


// BGM List
const MUSIC = new Audio("/music/Tetris-Theme-Tetris-Soundtrack (1).mp3");
const ROTATE_SOUND = new Audio("/music/ブロックを90度回した時の音.mp3");
const STACK_SOUND = new Audio("/music/下キーを押した時の音.mp3");
const DELETE_SOUND = new Audio("/music/ブロックが消える時の音.mp3");
const GAME_OVER = new Audio("/music/Game Over時の音.mp3")


// テトロミノの色
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
  [],                 // 空

  [                   // I
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],

  [                   // L
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],

  [                   // J
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],

  [                   // T
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0],
  ],

  [                   // O
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],

  [                   // Z
    [0, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],

  [                   // S
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
  ],

  [                   // ..
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
];


// ゲームオーバー変数
let over = false;

// フィールドの初期化
let field = [];

// ゲームスピード
let game_speed = 400;

document.body.style.background = url('/img/mountain-fantasy.jpg');


function init() {
  // 2次元配列で座標を生成
  // y座標のマスのフィールド作成(縦)
  for (let y = 0; y < FIELD_ROW; y++) {
    // フィールドを生成する為に空の配列を準備
    field[y] = [];
    // x座標のマスのフィールド作成(横)
    for (let x = 0; x < FIELD_COL; x++) {
      field[y][x] = 0;
    }
  }
}

// 初期化
init();

// テトロミノの変数
let tetro;
// 最初のテトロミノをランダムで生成
let tetro_t;

tetro_t = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;
tetro = TETRO_TYPES[tetro_t];



// テトロミノの表示
function drawBlock(x, y, c) {
  // テトロミノのブロックサイズ(変数tetroの配列を読み込み、1の数字があるマスはBLOCK_SIZE分、色がつく)
  let px = x * BLOCK_SIZE;
  let py = y * BLOCK_SIZE;

  // canvas 2D API Property
  // 図形の内側を塗りつぶすために使用
  con.fillStyle = TETRO_COLORS[c];
  // .fillRect(画面一番左から（x方向の）の距離,画面一番上から（y方向）の距離,x方向の幅,y方向の幅)
  con.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);

  // テトロミノに枠線を付ける
  con.strokeStyle = "black";
  con.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}


// フィールドの表示
function drawAll() {
  // テトロミノの存在した位置で色が残ったままになるので、次のテトロミノが移動する前に一度フィールド上を消去
  con.clearRect(0, 0, SCREEN_W, SCREEN_H);

  // フィールドが存在したらブロックの色や枠線が付く
  // ブロックの色や枠線だけをつけたい場合は記述しない
  for (let y = 0; y < FIELD_ROW; y++) {
    for (let x = 0; x < FIELD_COL; x++) {
      if (field[y][x]) {
        drawBlock(x, y, field[y][x]);
      }
    }
  }

  // テトロミノが存在したらブロックの色や枠線が付く
  for (let y = 0; y < TETRO_SIZE; y++) {
    for (let x = 0; x < TETRO_SIZE; x++) {
      if (tetro[y][x]) {
        // console.log(tetro[y][x])
        drawBlock(tetro_x + x, tetro_y + y, tetro_t);
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
        drawBlock(tetro_x + x, tetro_y + y + plus, "");
        // 本体
        drawBlock(tetro_x + x, tetro_y + y, "red");
      }
    }
  }

  // Game Over時の画面表示
  if (over == true) {
    let s = "GAME OVER";
    con.font = "40px 'MSゴシック'";
    let w = con.measureText(s).width;
    let x = SCREEN_W / 2 - w / 2;
    let y = SCREEN_H / 2 - 20;
    con.lineWidth = 4;
    con.strokeText(s, x, y);
    con.fillStyle = "white";
    con.fillText(s, x, y);
  }
}

drawAll();



// ラインが揃ってるかチェック
function checkLine() {
  for (let y = 0; y < FIELD_ROW; y++) {
    let flag = true;
    for (let x = 0; x < FIELD_COL; x++) {
      if (!field[y][x]) {
        flag = false;
        break;
      }
    }

    if (flag == true) {
      DELETE_SOUND.pause();
      DELETE_SOUND.play();
      for (let ny = y; ny > 0; ny--) {
        for (let nx = 0; nx < FIELD_COL; nx++) {
          // フィールドの一番下の行が揃った時の消える行を作成
          field[ny][nx] = field[ny - 1][nx];
        }
      }
    }
  }
}



// テトロミノの動ける範囲を確認
function checkMove(mx, my, ntetro) {
  if (ntetro == undefined) ntetro = tetro;

  for (let y = 0; y < TETRO_SIZE; y++) {
    for (let x = 0; x < TETRO_SIZE; x++) {
      // 新しいテトロミノの位置を指定する
      // 現在のテトロミノの座標 + 動く方向の数値 + マスindex
      let nx = tetro_x + mx + x;
      let ny = tetro_y + my + y;
      if (ntetro[y][x]) {
        if (ny < 0 || nx < 0 || ny >= FIELD_ROW || nx >= FIELD_COL || field[ny][nx]) {
          return false;
        }
      }
    }
  }
  return true;
}


// 90度回転
function rotate() {
  ROTATE_SOUND.play();
  let ntetro = [];
  for (let y = 0; y < TETRO_SIZE; y++) {
    ntetro[y] = [];
    for (let x = 0; x < TETRO_SIZE; x++) {
      ntetro[y][x] = tetro[TETRO_SIZE - x - 1][y];
    }
  }
  return ntetro;
}


// テトロミノが下についた時に固定させる
function fixTetro() {
  for (let y = 0; y < TETRO_SIZE; y++) {
    for (let x = 0; x < TETRO_SIZE; x++) {
      if (tetro[y][x]) {
        field[tetro_y + y][tetro_x + x] = tetro_t;
      }
    }
  }
}


// テトロミノを下に動かす
function dropTetro() {

  if (over == true) return;

  if (checkMove(0, 1)) tetro_y++;
  else {
    fixTetro();

    checkLine();

    tetro_x = START_X;
    tetro_y = START_Y;

    // テトロミノが下に付いたら次のテトロミノをランダムに生成
    tetro_t = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;
    tetro = TETRO_TYPES[tetro_t];

    // テトロミノが一番上まで到達したらGame Over
    if (!checkMove(0, 0)) over = true;
  }
  drawAll();
}
// 一定の間隔でテトロミノを落下させる
setInterval(dropTetro, game_speed);



// キーボードでテトロミノを操作
document.addEventListener('keydown', (e) => {

  // Game Overなら return
  if (over == true) return;
  // キーボードでの操作によりテトロミノが移動するため座標が変わる
  switch (e.key) {
    case "ArrowLeft":
      if (checkMove(-1, 0)) tetro_x--;
      break;
    case "ArrowUp":
      while (checkMove(0, 1)) tetro_y++;
      break;
    case "ArrowRight":
      if (checkMove(1, 0)) tetro_x++;
      break;
    case "ArrowDown":
      if (checkMove(0, 1)) tetro_y++;
      break;
    case " ":
      let ntetro = rotate();
      // 回転できるかチェック
      if (checkMove(0, 0, ntetro)) {
        tetro = ntetro;
      }
      break;
  }
  // 処理後にもう一度表示
  drawAll();
});