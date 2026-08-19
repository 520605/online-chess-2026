// shared-state.js - 共享内存状态存储
// 注意：在无服务器环境中，内存状态会在冷启动时丢失
// 生产环境建议使用 Redis 或数据库

const rooms = new Map();

// 初始化标准中国象棋棋盘
// 棋盘坐标系：(col, row)，col: 0-8 (左到右)，row: 0-9 (上到下)
function createInitialBoard() {
  // 10行 x 9列，null表示空位
  const board = Array.from({ length: 10 }, () => Array(9).fill(null));

  // 黑方棋子（上方，row 0-4）
  // row 0: 車 馬 象 士 將 士 象 馬 車
  board[0][0] = { type: 'chariot', color: 'black', name: '車' };
  board[0][1] = { type: 'horse', color: 'black', name: '馬' };
  board[0][2] = { type: 'elephant', color: 'black', name: '象' };
  board[0][3] = { type: 'advisor', color: 'black', name: '士' };
  board[0][4] = { type: 'general', color: 'black', name: '將' };
  board[0][5] = { type: 'advisor', color: 'black', name: '士' };
  board[0][6] = { type: 'elephant', color: 'black', name: '象' };
  board[0][7] = { type: 'horse', color: 'black', name: '馬' };
  board[0][8] = { type: 'chariot', color: 'black', name: '車' };

  // row 2: 砲（炮）
  board[2][1] = { type: 'cannon', color: 'black', name: '砲' };
  board[2][7] = { type: 'cannon', color: 'black', name: '砲' };

  // row 3: 卒
  board[3][0] = { type: 'soldier', color: 'black', name: '卒' };
  board[3][2] = { type: 'soldier', color: 'black', name: '卒' };
  board[3][4] = { type: 'soldier', color: 'black', name: '卒' };
  board[3][6] = { type: 'soldier', color: 'black', name: '卒' };
  board[3][8] = { type: 'soldier', color: 'black', name: '卒' };

  // 红方棋子（下方，row 5-9）
  // row 9: 車 馬 相 仕 帥 仕 相 馬 車
  board[9][0] = { type: 'chariot', color: 'red', name: '車' };
  board[9][1] = { type: 'horse', color: 'red', name: '馬' };
  board[9][2] = { type: 'elephant', color: 'red', name: '相' };
  board[9][3] = { type: 'advisor', color: 'red', name: '仕' };
  board[9][4] = { type: 'general', color: 'red', name: '帥' };
  board[9][5] = { type: 'advisor', color: 'red', name: '仕' };
  board[9][6] = { type: 'elephant', color: 'red', name: '相' };
  board[9][7] = { type: 'horse', color: 'red', name: '馬' };
  board[9][8] = { type: 'chariot', color: 'red', name: '車' };

  // row 7: 炮
  board[7][1] = { type: 'cannon', color: 'red', name: '炮' };
  board[7][7] = { type: 'cannon', color: 'red', name: '炮' };

  // row 6: 兵
  board[6][0] = { type: 'soldier', color: 'red', name: '兵' };
  board[6][2] = { type: 'soldier', color: 'red', name: '兵' };
  board[6][4] = { type: 'soldier', color: 'red', name: '兵' };
  board[6][6] = { type: 'soldier', color: 'red', name: '兵' };
  board[6][8] = { type: 'soldier', color: 'red', name: '兵' };

  return board;
}

// 生成6位随机房间号
function generateRoomId() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

module.exports = { rooms, createInitialBoard, generateRoomId };
