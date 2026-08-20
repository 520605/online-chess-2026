// poll-chat.js - 轮询聊天消息（使用 Netlify Blobs）
const { getRoom } = require('./shared-state');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const roomId = event.queryStringParameters?.roomId;
    const lastId = parseInt(event.queryStringParameters?.lastId || '0');

    if (!roomId) return { statusCode: 400, body: JSON.stringify({ error: '请提供房间号' }) };

    const room = await getRoom(roomId);
    if (!room) return { statusCode: 404, body: JSON.stringify({ error: '房间不存在' }) };

    const messages = room.chat.filter(msg => msg.id > lastId);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ messages, lastId: room.chatIdCounter })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error: ' + error.message }) };
  }
};
