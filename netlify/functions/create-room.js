// create-room.js - 创建游戏房间
const { rooms, createInitialBoard, generateRoomId } = require('./shared-state');

exports.handler = async (event) => {
  // 只接受 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // 生成唯一的房间号
    let roomId;
    do {
      roomId = generateRoomId();
    } while (rooms.has(roomId));

    // 创建房间状态
    const room = {
      red: null,
      black: null,
      board: createInitialBoard(),
      turn: 'red', // 红方先手
      moves: [], // 移动历史
      chat: [], // 聊天记录
      status: 'waiting', // waiting | playing | finished
      lastMove: null, // 上一步移动
      message: '', // 游戏消息
      gameOver: false,
      winner: null,
      chatIdCounter: 0
    };

    // 设置红方玩家（创建者）
    room.red = { joined: true };
    
    rooms.set(roomId, room);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        roomId,
        role: 'red',
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
