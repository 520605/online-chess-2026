// join-room.js - 加入游戏房间（使用 Netlify Blobs）
const { getRoom, setRoom } = require('./shared-state');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { roomId } = JSON.parse(event.body);
    if (!roomId) return { statusCode: 400, body: JSON.stringify({ error: '请提供房间号' }) };

    const room = await getRoom(roomId);
    if (!room) return { statusCode: 404, body: JSON.stringify({ error: '房间不存在' }) };
    if (room.black && room.black.joined) return { statusCode: 400, body: JSON.stringify({ error: '房间已满' }) };

    room.black = { joined: true };
    room.status = 'playing';
    await setRoom(roomId, room);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ roomId, role: 'black', board: room.board, turn: room.turn, status: room.status })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error: ' + error.message }) };
  }
};
