// make-move.js - 执行棋子移动（使用 Netlify Blobs + 完整中国象棋规则）
const { getRoom, setRoom } = require('./shared-state');

function cloneBoard(board) {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

function inBounds(col, row) {
  return col >= 0 && col <= 8 && row >= 0 && row <= 9;
}

function inPalace(col, row, color) {
  if (col < 3 || col > 5) return false;
  if (color === 'red') return row >= 7 && row <= 9;
  if (color === 'black') return row >= 0 && row <= 2;
  return false;
}

function generalsFaceEachOther(board) {
  let redGeneral = null;
  let blackGeneral = null;
  for (let row = 0; row <= 9; row++) {
    for (let col = 3; col <= 5; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'general') {
        if (piece.color === 'red') redGeneral = { col, row };
        if (piece.color === 'black') blackGeneral = { col, row };
      }
    }
  }
  if (!redGeneral || !blackGeneral) return false;
  if (redGeneral.col !== blackGeneral.col) return false;
  const minRow = Math.min(redGeneral.row, blackGeneral.row);
  const maxRow = Math.max(redGeneral.row, blackGeneral.row);
  for (let row = minRow + 1; row < maxRow; row++) {
    if (board[row][redGeneral.col]) return false;
  }
  return true;
}

function isValidMove(board, fromCol, fromRow, toCol, toRow, color) {
  const piece = board[fromRow][fromCol];
  if (!piece || piece.color !== color) return false;
  const target = board[toRow][toCol];
  if (target && target.color === color) return false;

  const colDiff = Math.abs(toCol - fromCol);
  const rowDiff = Math.abs(toRow - fromRow);

  switch (piece.type) {
    case 'general':
      if (!((colDiff === 1 && rowDiff === 0) || (colDiff === 0 && rowDiff === 1))) return false;
      if (!inPalace(toCol, toRow, color)) return false;
      return true;
    case 'advisor':
      if (colDiff !== 1 || rowDiff !== 1) return false;
      if (!inPalace(toCol, toRow, color)) return false;
      return true;
    case 'elephant':
      if (colDiff !== 2 || rowDiff !== 2) return false;
      if (color === 'red' && toRow <= 4) return false;
      if (color === 'black' && toRow >= 5) return false;
      const eyeCol = fromCol + (toCol - fromCol) / 2;
      const eyeRow = fromRow + (toRow - fromRow) / 2;
      if (board[eyeRow][eyeCol]) return false;
      return true;
    case 'horse':
      if (!((colDiff === 1 && rowDiff === 2) || (colDiff === 2 && rowDiff === 1))) return false;
      if (colDiff === 2) {
        const legCol = fromCol + (toCol - fromCol) / 2;
        if (board[fromRow][legCol]) return false;
      } else {
        const legRow = fromRow + (toRow - fromRow) / 2;
        if (board[legRow][fromCol]) return false;
      }
      return true;
    case 'chariot':
      if (fromCol !== toCol && fromRow !== toRow) return false;
      if (fromCol === toCol) {
        const minR = Math.min(fromRow, toRow);
        const maxR = Math.max(fromRow, toRow);
        for (let r = minR + 1; r < maxR; r++) {
          if (board[r][fromCol]) return false;
        }
      } else {
        const minC = Math.min(fromCol, toCol);
        const maxC = Math.max(fromCol, toCol);
        for (let c = minC + 1; c < maxC; c++) {
          if (board[fromRow][c]) return false;
        }
      }
      return true;
    case 'cannon':
      if (fromCol !== toCol && fromRow !== toRow) return false;
      let count = 0;
      if (fromCol === toCol) {
        const minR = Math.min(fromRow, toRow);
        const maxR = Math.max(fromRow, toRow);
        for (let r = minR + 1; r < maxR; r++) {
          if (board[r][fromCol]) count++;
        }
      } else {
        const minC = Math.min(fromCol, toCol);
        const maxC = Math.max(fromCol, toCol);
        for (let c = minC + 1; c < maxC; c++) {
          if (board[fromRow][c]) count++;
        }
      }
      if (target) {
        return count === 1;
      } else {
        return count === 0;
      }
    case 'soldier':
      if (color === 'red') {
        if (fromRow <= 4) {
          return rowDiff === 1 && colDiff === 0 && toRow < fromRow;
        } else {
          if (toRow >= fromRow) return false;
          return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
        }
      } else {
        if (fromRow >= 5) {
          return rowDiff === 1 && colDiff === 0 && toRow > fromRow;
        } else {
          if (toRow <= fromRow) return false;
          return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
        }
      }
    default:
      return false;
  }
}

function isInCheck(board, color) {
  let generalPos = null;
  for (let r = 0; r <= 9; r++) {
    for (let c = 0; c <= 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'general' && p.color === color) {
        generalPos = { col: c, row: r };
        break;
      }
    }
    if (generalPos) break;
  }
  if (!generalPos) return true;

  const enemyColor = color === 'red' ? 'black' : 'red';
  for (let r = 0; r <= 9; r++) {
    for (let c = 0; c <= 8; c++) {
      const p = board[r][c];
      if (p && p.color === enemyColor) {
        if (isValidMove(board, c, r, generalPos.col, generalPos.row, enemyColor)) {
          return true;
        }
      }
    }
  }
  return false;
}

function hasLegalMoves(board, color) {
  for (let fromRow = 0; fromRow <= 9; fromRow++) {
    for (let fromCol = 0; fromCol <= 8; fromCol++) {
      const piece = board[fromRow][fromCol];
      if (piece && piece.color === color) {
        for (let toRow = 0; toRow <= 9; toRow++) {
          for (let toCol = 0; toCol <= 8; toCol++) {
            if (fromCol === toCol && fromRow === toRow) continue;
            if (!isValidMove(board, fromCol, fromRow, toCol, toRow, color)) continue;
            const testBoard = cloneBoard(board);
            testBoard[toRow][toCol] = testBoard[fromRow][fromCol];
            testBoard[fromRow][fromCol] = null;
            if (generalsFaceEachOther(testBoard)) continue;
            if (!isInCheck(testBoard, color)) return true;
          }
        }
      }
    }
  }
  return false;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { roomId, from, to, role } = JSON.parse(event.body);
    if (!roomId || !from || !to || !role) return { statusCode: 400, body: JSON.stringify({ error: '参数不完整' }) };

    const room = await getRoom(roomId);
    if (!room) return { statusCode: 404, body: JSON.stringify({ error: '房间不存在' }) };
    if (room.status !== 'playing') return { statusCode: 400, body: JSON.stringify({ error: '游戏未开始' }) };
    if (room.gameOver) return { statusCode: 400, body: JSON.stringify({ error: '游戏已结束' }) };
    if (room.turn !== role) return { statusCode: 400, body: JSON.stringify({ error: '还没轮到你走棋' }) };

    const [fromCol, fromRow] = from;
    const [toCol, toRow] = to;

    if (!inBounds(fromCol, fromRow) || !inBounds(toCol, toRow)) return { statusCode: 400, body: JSON.stringify({ error: '坐标超出范围' }) };

    const piece = room.board[fromRow][fromCol];
    if (!piece) return { statusCode: 400, body: JSON.stringify({ error: '该位置没有棋子' }) };
    if (piece.color !== role) return { statusCode: 400, body: JSON.stringify({ error: '不能移动对方的棋子' }) };
    if (!isValidMove(room.board, fromCol, fromRow, toCol, toRow, role)) return { statusCode: 400, body: JSON.stringify({ error: '不合法的走法' }) };

    const newBoard = cloneBoard(room.board);
    const capturedPiece = newBoard[toRow][toCol];
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = null;

    if (generalsFaceEachOther(newBoard)) return { statusCode: 400, body: JSON.stringify({ error: '不能飞将（将帅面对面）' }) };
    if (isInCheck(newBoard, role)) return { statusCode: 400, body: JSON.stringify({ error: '不能送将（走完后自己被将军）' }) };

    room.board = newBoard;
    room.lastMove = { from, to };
    room.moves.push({ from, to, role, piece: piece.name });

    const enemyColor = role === 'red' ? 'black' : 'red';
    const enemyInCheck = isInCheck(newBoard, enemyColor);
    const enemyHasLegalMoves = hasLegalMoves(newBoard, enemyColor);

    let message = '';
    let gameOver = false;
    let winner = null;

    if (enemyInCheck && !enemyHasLegalMoves) {
      gameOver = true;
      winner = role;
      message = role === 'red' ? '红方将杀，红方胜利！' : '黑方将杀，黑方胜利！';
      room.status = 'finished';
    } else if (!enemyInCheck && !enemyHasLegalMoves) {
      gameOver = true;
      winner = role;
      message = role === 'red' ? '黑方困毙，红方胜利！' : '红方困毙，黑方胜利！';
      room.status = 'finished';
    } else if (enemyInCheck) {
      message = '将军！';
    } else {
      message = role === 'red' ? '黑方走棋' : '红方走棋';
    }

    room.turn = enemyColor;
    room.message = message;
    room.gameOver = gameOver;
    room.winner = winner;

    await setRoom(roomId, room);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true, board: room.board, turn: room.turn,
        lastMove: room.lastMove, message, gameOver, winner,
        captured: capturedPiece ? capturedPiece.name : null
      })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error: ' + error.message }) };
  }
};
