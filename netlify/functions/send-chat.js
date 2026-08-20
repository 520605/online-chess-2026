// send-chat.js - 发送聊天消息（使用 Netlify Blobs）
const { getRoom, setRoom } = require('./shared-state');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { roomId, role, message } = JSON.parse(event.body);
    if (!roomId || !role || !message) return { statusCode: 400, body: JSON.stringify({ error: '参数不完整' }) };

    const room = await getRoom(roomId);
    if (!room) return { statusCode: 404, body: JSON.stringify({ error: '房间不存在' }) };

    const chatMessage = {
      id: ++room.chatIdCounter,
      role,
      roleLabel: role === 'red' ? '红方' : '黑方',
      message: message.substring(0, 200),
      timestamp: Date.now()
    };
    room.chat.push(chatMessage);
    await setRoom(roomId, room);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, chatMessage })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error: ' + error.message }) };
  }
};
