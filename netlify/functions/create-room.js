// create-room.js - 创建游戏房间（使用 Netlify Blobs）
const { createInitialBoard, generateRoomId, getRoom, setRoom } = require('./shared-state');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    let roomId;
    let attempts = 0;

    do {
      roomId = generateRoomId();
      attempts++;
    } while ((await getRoom(roomId)) && attempts < 100);

    const room = {
      red: { joined: true },
      black: null,
      board: createInitialBoard(),
      turn: 'red',
      moves: [],
      chat: [],
      status: 'waiting',
      lastMove: null,
      message: '',
      gameOver: false,
      winner: null,
      chatIdCounter: 0
    };

    await setRoom(roomId, room);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ roomId, role: 'red', board: room.board, turn: room.turn, status: room.status })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error: ' + error.message }) };
  }
};
