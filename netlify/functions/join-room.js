// join-room.js - 加入游戏房间
const { rooms } = require('./shared-state');

exports.handler = async (event) => {
  // 只接受 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { roomId } = JSON.parse(event.body);

    if (!roomId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '请提供房间号' })
      };
    }

    // 查找房间
    const room = rooms.get(roomId);

    if (!room) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: '房间不存在' })
      };
    }

    // 检查房间是否已满
    if (room.black && room.black.joined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '房间已满' })
      };
    }

    // 设置黑方玩家
    room.black = { joined: true };
    room.status = 'playing'; // 双方都加入，游戏开始

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        roomId,
        role: 'black',
        board: room.board,
        turn: room.turn,
        status: room.status
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error: ' + error.message })
    };
  }
};
