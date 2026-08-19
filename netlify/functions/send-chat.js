// send-chat.js - 发送聊天消息
const { rooms } = require('./shared-state');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { roomId, role, message } = JSON.parse(event.body);

    if (!roomId || !role || !message) {
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

    // 创建聊天消息
    const chatMessage = {
      id: ++room.chatIdCounter,
      role,
      roleLabel: role === 'red' ? '红方' : '黑方',
      message: message.substring(0, 200), // 限制消息长度
      timestamp: Date.now()
    };

    room.chat.push(chatMessage);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        chatMessage
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error: ' + error.message })
    };
  }
};
