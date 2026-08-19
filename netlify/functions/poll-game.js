// poll-game.js - 轮询游戏状态
const { rooms } = require('./shared-state');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const roomId = event.queryStringParameters?.roomId;

    if (!roomId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '请提供房间号' })
      };
    }

    const room = rooms.get(roomId);

    if (!room) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: '房间不存在' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        board: room.board,
        turn: room.turn,
        moves: room.moves,
        status: room.status,
        lastMove: room.lastMove,
        message: room.message,
        gameOver: room.gameOver,
        winner: room.winner
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error: ' + error.message })
    };
  }
};
