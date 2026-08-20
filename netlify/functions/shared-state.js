// shared-state.js - 使用 Netlify Blobs 持久化存储
const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'chess-rooms';

function getStoreInstance() {
  return getStore(STORE_NAME);
}

function createInitialBoard() {
  const board = Array.from({ length: 10 }, () => Array(9).fill(null));

  board[0][0] = { type: 'chariot', color: 'black', name: '車' };
  board[0][1] = { type: 'horse', color: 'black', name: '馬' };
  board[0][2] = { type: 'elephant', color: 'black', name: '象' };
  board[0][3] = { type: 'advisor', color: 'black', name: '士' };
  board[0][4] = { type: 'general', color: 'black', name: '將' };
  board[0][5] = { type: 'advisor', color: 'black', name: '士' };
  board[0][6] = { type: 'elephant', color: 'black', name: '象' };
  board[0][7] = { type: 'horse', color: 'black', name: '馬' };
  board[0][8] = { type: 'chariot', color: 'black', name: '車' };
  board[2][1] = { type: 'cannon', color: 'black', name: '砲' };
  board[2][7] = { type: 'cannon', color: 'black', name: '砲' };
  board[3][0] = { type: 'soldier', color: 'black', name: '卒' };
  board[3][2] = { type: 'soldier', color: 'black', name: '卒' };
  board[3][4] = { type: 'soldier', color: 'black', name: '卒' };
  board[3][6] = { type: 'soldier', color: 'black', name: '卒' };
  board[3][8] = { type: 'soldier', color: 'black', name: '卒' };

  board[9][0] = { type: 'chariot', color: 'red', name: '車' };
  board[9][1] = { type: 'horse', color: 'red', name: '馬' };
  board[9][2] = { type: 'elephant', color: 'red', name: '相' };
  board[9][3] = { type: 'advisor', color: 'red', name: '仕' };
  board[9][4] = { type: 'general', color: 'red', name: '帥' };
  board[9][5] = { type: 'advisor', color: 'red', name: '仕' };
  board[9][6] = { type: 'elephant', color: 'red', name: '相' };
  board[9][7] = { type: 'horse', color: 'red', name: '馬' };
  board[9][8] = { type: 'chariot', color: 'red', name: '車' };
  board[7][1] = { type: 'cannon', color: 'red', name: '炮' };
  board[7][7] = { type: 'cannon', color: 'red', name: '炮' };
  board[6][0] = { type: 'soldier', color: 'red', name: '兵' };
  board[6][2] = { type: 'soldier', color: 'red', name: '兵' };
  board[6][4] = { type: 'soldier', color: 'red', name: '兵' };
  board[6][6] = { type: 'soldier', color: 'red', name: '兵' };
  board[6][8] = { type: 'soldier', color: 'red', name: '兵' };

  return board;
}

function generateRoomId() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function getRoom(roomId) {
  const store = getStoreInstance();
  const data = await store.get(roomId, { type: 'json' });
  return data;
}

async function setRoom(roomId, roomData) {
  const store = getStoreInstance();
  await store.set(roomId, JSON.stringify(roomData));
}

module.exports = { createInitialBoard, generateRoomId, getRoom, setRoom };
