// make-move.js - 执行棋子移动（包含完整的中国象棋规则验证）
const { rooms } = require('./shared-state');

// 深拷贝棋盘
function cloneBoard(board) {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

// 检查坐标是否在棋盘范围内
function inBounds(col, row) {
  return col >= 0 && col <= 8 && row >= 0 && row <= 9;
}

// 检查是否在九宫格内
function inPalace(col, row, color) {
  if (col < 3 || col > 5) return false;
  if (color === 'red') return row >= 7 && row <= 9;
  if (color === 'black') return row >= 0 && row <= 2;
  return false;
}

// 检查是否过河
function hasCrossedRiver(row, color) {
  if (color === 'red') return row <= 4;
  if (color === 'black') return row >= 5;
  return false;
}

// 检查将帅是否面对面（飞将）
function generalsFaceEachOther(board) {
  let redGeneral = null;
  let blackGeneral = null;

  // 找到双方将帅位置
  for (let row = 0; row <= 9; row++) {
    for (let col = 3; col <= 5; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'general') {
        if (piece.color === 'red') redGeneral = { col, row };
        if (piece.color === 'black') blackGeneral = { col, row };
      }
    }
  }

  // 如果任一方将帅不在，返回false
  if (!redGeneral || !blackGeneral) return false;

  // 检查是否在同一列
  if (redGeneral.col !== blackGeneral.col) return false;

  // 检查中间是否有其他棋子
  const minRow = Math.min(redGeneral.row, blackGeneral.row);
  const maxRow = Math.max(redGeneral.row, blackGeneral.row);
  for (let row = minRow + 1; row < maxRow; row++) {
    if (board[row][redGeneral.col]) return false;
  }

  return true; // 面对面
}

// 验证移动是否合法（不含将军检测）
function isValidMove(board, fromCol, fromRow, toCol, toRow, color) {
  const piece = board[fromRow][fromCol];
  if (!piece || piece.color !== color) return false;

  const target = board[toRow][toCol];
  // 不能吃自己的棋子
  if (target && target.color === color) return false;

  const colDiff = Math.abs(toCol - fromCol);
  const rowDiff = Math.abs(toRow - fromRow);

  switch (piece.type) {
    case 'general': // 将/帅
      // 只能走一步，水平或垂直
      if (!((colDiff === 1 && rowDiff === 0) || (colDiff === 0 && rowDiff === 1))) return false;
      // 不能走出九宫格
      if (!inPalace(toCol, toRow, color)) return false;
      return true;

    case 'advisor': // 士/仕
      // 走对角线一步
      if (colDiff !== 1 || rowDiff !== 1) return false;
      // 不能走出九宫格
      if (!inPalace(toCol, toRow, color)) return false;
      return true;

    case 'elephant': // 象/相
      // 走"田"字（对角移动两格）
      if (colDiff !== 2 || rowDiff !== 2) return false;
      // 不能过河
      if (color === 'red' && toRow <= 4) return false;
      if (color === 'black' && toRow >= 5) return false;
      // 检查象眼（中间位置）是否被堵
      const eyeCol = fromCol + (toCol - fromCol) / 2;
      const eyeRow = fromRow + (toRow - fromRow) / 2;
      if (board[eyeRow][eyeCol]) return false; // 塞象眼
      return true;

    case 'horse': // 馬
      // 走"日"字：先直走一步，再斜走一步
      if (!((colDiff === 1 && rowDiff === 2) || (colDiff === 2 && rowDiff === 1))) return false;
      // 检查蹩马腿
      if (colDiff === 2) {
        // 水平方向先走，检查水平方向相邻位置
        const legCol = fromCol + (toCol - fromCol) / 2;
        if (board[fromRow][legCol]) return false; // 蹩马腿
      } else {
        // 垂直方向先走，检查垂直方向相邻位置
        const legRow = fromRow + (toRow - fromRow) / 2;
        if (board[legRow][fromCol]) return false; // 蹩马腿
      }
      return true;

    case 'chariot': // 車
      // 水平或垂直移动
      if (fromCol !== toCol && fromRow !== toRow) return false;
      // 检查路径上是否有棋子
      if (fromCol === toCol) {
        // 垂直移动
        const minR = Math.min(fromRow, toRow);
        const maxR = Math.max(fromRow, toRow);
        for (let r = minR + 1; r < maxR; r++) {
          if (board[r][fromCol]) return false;
        }
      } else {
        // 水平移动
        const minC = Math.min(fromCol, toCol);
        const maxC = Math.max(fromCol, toCol);
        for (let c = minC + 1; c < maxC; c++) {
          if (board[fromRow][c]) return false;
        }
      }
      return true;

    case 'cannon': // 炮
      // 水平或垂直移动
      if (fromCol !== toCol && fromRow !== toRow) return false;
      // 计算路径上的棋子数
      let count = 0;
      if (fromCol === toCol) {
        // 垂直移动
        const minR = Math.min(fromRow, toRow);
        const maxR = Math.max(fromRow, toRow);
        for (let r = minR + 1; r < maxR; r++) {
          if (board[r][fromCol]) count++;
        }
      } else {
        // 水平移动
        const minC = Math.min(fromCol, toCol);
        const maxC = Math.max(fromCol, toCol);
        for (let c = minC + 1; c < maxC; c++) {
          if (board[fromRow][c]) count++;
        }
      }
      // 不吃子时，路径上不能有棋子
      if (!target && count === 0) return true;
      // 吃子时，必须恰好有一个棋子（炮架）
      if (target && count === 1) return true;
      return false;

    case 'soldier': // 兵/卒
      if (color === 'red') {
        // 红方前进方向：row减小
        if (!hasCrossedRiver(fromRow, 'red')) {
          // 过河前只能向前
          if (toCol !== fromCol || toRow !== fromRow - 1) return false;
        } else {
          // 过河后可以向前、左、右
          if (toRow > fromRow) return false; // 不能后退
          if (rowDiff + colDiff !== 1) return false; // 只能走一步
        }
      } else {
        // 黑方前进方向：row增大
        if (!hasCrossedRiver(fromRow, 'black')) {
          // 过河前只能向前
          if (toCol !== fromCol || toRow !== fromRow + 1) return false;
        } else {
          // 过河后可以向前、左、右
          if (toRow < fromRow) return false; // 不能后退
          if (rowDiff + colDiff !== 1) return false; // 只能走一步
        }
      }
      return true;

    default:
      return false;
  }
}

// 检查某方是否被将军
function isInCheck(board, color) {
  // 找到该方将帅位置
  let generalPos = null;
  for (let row = 0; row <= 9; row++) {
    for (let col = 0; col <= 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'general' && piece.color === color) {
        generalPos = { col, row };
        break;
      }
    }
    if (generalPos) break;
  }

  if (!generalPos) return true; // 将帅被吃，视为被将军

  const enemyColor = color === 'red' ? 'black' : 'red';

  // 检查对方所有棋子是否能攻击到将帅
  for (let row = 0; row <= 9; row++) {
    for (let col = 0; col <= 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === enemyColor) {
        if (isValidMove(board, col, row, generalPos.col, generalPos.row, enemyColor)) {
          return true;
        }
      }
    }
  }

  return false;
}

// 检查某方是否有合法走法
function hasLegalMoves(board, color) {
  // 遍历该方所有棋子
  for (let fromRow = 0; fromRow <= 9; fromRow++) {
    for (let fromCol = 0; fromCol <= 8; fromCol++) {
      const piece = board[fromRow][fromCol];
      if (!piece || piece.color !== color) continue;

      // 尝试所有可能的目标位置
      for (let toRow = 0; toRow <= 9; toRow++) {
        for (let toCol = 0; toCol <= 8; toCol++) {
          if (fromCol === toCol && fromRow === toRow) continue;

          if (isValidMove(board, fromCol, fromRow, toCol, toRow, color)) {
            // 模拟走棋，检查是否会被将军
            const testBoard = cloneBoard(board);
            testBoard[toRow][toCol] = testBoard[fromRow][fromCol];
            testBoard[fromRow][fromCol] = null;

            // 检查飞将
            if (generalsFaceEachOther(testBoard)) continue;

            // 检查走完后是否被将军
            if (!isInCheck(testBoard, color)) {
              return true; // 找到合法走法
            }
          }
        }
      }
    }
  }

  return false; // 没有合法走法
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { roomId, from, to, role } = JSON.parse(event.body);

    if (!roomId || !from || !to || !role) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '参数不完整' })
      };
    }

    const room = rooms.get(roomId);

    if (!room) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: '房间不存在' })
      };
    }

    if (room.status !== 'playing') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '游戏未开始' })
      };
    }

    if (room.gameOver) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '游戏已结束' })
      };
    }

    // 检查是否轮到该玩家
    if (room.turn !== role) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '还没轮到你走棋' })
      };
    }

    const [fromCol, fromRow] = from;
    const [toCol, toRow] = to;

    // 验证坐标范围
    if (!inBounds(fromCol, fromRow) || !inBounds(toCol, toRow)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '坐标超出范围' })
      };
    }

    const piece = room.board[fromRow][fromCol];

    // 检查是否有棋子
    if (!piece) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '该位置没有棋子' })
      };
    }

    // 检查是否是自己的棋子
    if (piece.color !== role) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '不能移动对方的棋子' })
      };
    }

    // 验证走法合法性
    if (!isValidMove(room.board, fromCol, fromRow, toCol, toRow, role)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '不合法的走法' })
      };
    }

    // 模拟走棋
    const newBoard = cloneBoard(room.board);
    const capturedPiece = newBoard[toRow][toCol];
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = null;

    // 检查飞将
    if (generalsFaceEachOther(newBoard)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '不能飞将（将帅面对面）' })
      };
    }

    // 检查走完后自己是否被将军
    if (isInCheck(newBoard, role)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '不能送将（走完后自己被将军）' })
      };
    }

    // 走法合法，更新棋盘
    room.board = newBoard;
    room.lastMove = { from, to };
    room.moves.push({ from, to, role, piece: piece.name });

    // 检查对方是否被将军
    const enemyColor = role === 'red' ? 'black' : 'red';
    const enemyInCheck = isInCheck(newBoard, enemyColor);
    const enemyHasLegalMoves = hasLegalMoves(newBoard, enemyColor);

    let message = '';
    let gameOver = false;
    let winner = null;

    if (enemyInCheck && !enemyHasLegalMoves) {
      // 将杀
      gameOver = true;
      winner = role;
      message = role === 'red' ? '红方将杀，红方胜利！' : '黑方将杀，黑方胜利！';
      room.status = 'finished';
    } else if (!enemyInCheck && !enemyHasLegalMoves) {
      // 困毙（无合法走法且未被将军）
      gameOver = true;
      winner = role;
      message = role === 'red' ? '黑方困毙，红方胜利！' : '红方困毙，黑方胜利！';
      room.status = 'finished';
    } else if (enemyInCheck) {
      // 将军
      message = '将军！';
    } else {
      message = role === 'red' ? '黑方走棋' : '红方走棋';
    }

    // 切换轮次
    room.turn = enemyColor;
    room.message = message;
    room.gameOver = gameOver;
    room.winner = winner;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        board: room.board,
        turn: room.turn,
        lastMove: room.lastMove,
        message,
        gameOver,
        winner,
        captured: capturedPiece ? capturedPiece.name : null
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error: ' + error.message })
    };
  }
};
