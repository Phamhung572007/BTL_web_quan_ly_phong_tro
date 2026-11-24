const path = require('node:path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

let ketNoiDangChay = null;

async function ketNoiDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (ketNoiDangChay) return ketNoiDangChay;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Thiếu MONGODB_URI. Hãy cấu hình biến này trong backend/.env.');
  }

  ketNoiDangChay = mongoose.connect(uri, {
    dbName: process.env.MONGODB_DATABASE || 'quan_ly_phong_tro',
    serverSelectionTimeoutMS: Number(process.env.MONGODB_TIMEOUT_MS) || 10000,
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE) || 10,
  }).then(() => mongoose.connection)
    .finally(() => {
      ketNoiDangChay = null;
    });

  return ketNoiDangChay;
}

async function dongKetNoiDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = { ketNoiDatabase, dongKetNoiDatabase };
