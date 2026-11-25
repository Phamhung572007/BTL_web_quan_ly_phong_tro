const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const NguoiDung = require('../models/nguoi_dung');
const { guiThatBai } = require('../utils/phan_hoi_api');

function layIdNguoiDung(payload) {
  return payload?.sub
    || payload?._id
    || payload?.id
    || payload?.nguoiDungId
    || payload?.userId
    || payload?.user?._id
    || payload?.user?.id
    || null;
}

async function xacThuc(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return guiThatBai(res, {
      statusCode: 401,
      message: 'Bạn cần đăng nhập để tiếp tục.',
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return guiThatBai(res, {
      statusCode: 500,
      message: 'Backend chưa được cấu hình JWT_SECRET.',
    });
  }

  let payload;
  try {
    payload = jwt.verify(match[1], secret, { algorithms: ['HS256'] });
  } catch (error) {
    const message = error.name === 'TokenExpiredError'
      ? 'Phiên đăng nhập đã hết hạn.'
      : 'Token đăng nhập không hợp lệ.';
    return guiThatBai(res, { statusCode: 401, message });
  }

  const nguoiDungId = layIdNguoiDung(payload);
  if (!nguoiDungId || !mongoose.isValidObjectId(nguoiDungId)) {
    return guiThatBai(res, {
      statusCode: 401,
      message: 'Token không chứa mã tài khoản hợp lệ.',
    });
  }

  try {
    const nguoiDung = await NguoiDung.findById(nguoiDungId)
      .select('-matKhau -__v')
      .lean();

    if (!nguoiDung || nguoiDung.trangThai !== 'HOAT_DONG') {
      return guiThatBai(res, {
        statusCode: 401,
        message: 'Tài khoản không tồn tại hoặc đã bị khóa.',
      });
    }

    req.user = nguoiDung;
    req.nguoiDung = nguoiDung;
    req.taiKhoan = nguoiDung;
    req.auth = { nguoiDungId: String(nguoiDung._id) };
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  xacThuc,
  xacThucJWT: xacThuc,
  kiemTraToken: xacThuc,
  authenticateToken: xacThuc,
};
