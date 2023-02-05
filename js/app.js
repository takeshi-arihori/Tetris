'use strict';

// テトロミノの落ちるスピード
let game_speed = 300;

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


// キャンバスAPIを取得
let can = document.getElementById("can");
let con = can.getContext("2d")

can.width = SCREEN_W;
can.height = SCREEN_H;
can.style.border = "5px solid #555"; // fieldの線

// テトロミノ本体
let tetro = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0]
];

// テトロミノの座標
let tetro_x = 0;
let tetro_y = 0;

// フィールドの中身
let field = [];

init(); // 初期化
drawAll(); // 描画

setInterval(dropTetro, game_speed);

// 初期化
function init() {
  for (let y = 0; y < FIELD_ROW; y++) {
    field[y] = [];
    for (let x = 0; x < FIELD_COL; x++) {
      field[y][x] = 0;
    }
  }
  // テスト(指定した座標にブロック表示)
  field[6][9] = 1;
  field[19][9] = 1;
  field[14][5] = 1;
}


// ブロック一つを描画
function drawBlock(x, y) {
  let px = x * BLOCK_SIZE;
  let py = y * BLOCK_SIZE;

  con.fillStyle = "red";
  con.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
  con.strokeStyle = "black";
  con.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE)
}


// 全てを描画
function drawAll() {
  con.clearRect(0, 0, SCREEN_W, SCREEN_H); // フィールドを表示する前にクリア
  // フィールドを描画
  for (let y = 0; y < FIELD_ROW; y++) {
    for (let x = 0; x < FIELD_COL; x++) {
      if (field[y][x]) {
        drawBlock(x, y);
      }
    }
  }
  // ブロック一つを描画
  for (let y = 0; y < TETRO_SIZE; y++) {
    for (let x = 0; x < TETRO_SIZE; x++) {
      if (tetro[y][x]) {
        drawBlock(tetro_x + x, tetro_y + y);
      }
    }
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
      console.log("tetro-size: " + (TETRO_SIZE - x - 1) + " / y: " + y)
      newTetro[y][x] = tetro[TETRO_SIZE - x - 1][y];
      console.log("y: " + y);
      console.log("x: " + x);
      console.log("tetro: " + tetro);
      console.log("newTetro: " + newTetro);
      console.log("ーーーーーーーーーーーーーーーーーーー");
    }
  }
  return newTetro;
}

// 衝突時はテトロミノを固定
function fixTetro() {
  for (let y = 0; y < TETRO_SIZE; y++) {
    for (let x = 0; x < TETRO_SIZE; x++) {
      if (tetro[y][x]) {
        field[tetro_y + y][tetro_x + x] = 1;
      }
    }
  }
}

// テトロミノの落下処理
function dropTetro() {
  if (checkMove(0, 1)) tetro_y++;
  else {
    fixTetro();
    tetro_x = 0;
    tetro_y = 0;
  }
  drawAll();
}

// キーボードが押された時の処理
document.onkeydown = (e) => {

  switch (e.key) {
    case "ArrowLeft":
      if (checkMove(-1, 0)) tetro_x--;
      break;
    case "ArrowUp":
      if (checkMove(0, -1)) tetro_y--;
      break;
    case "ArrowRight":
      if (checkMove(1, 0)) tetro_x++;
      break;
    case "ArrowDown":
      if (checkMove(0, 1)) tetro_y++;
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

