const jwt = require('jsonwebtoken');
const NguoiDung = require('../models/nguoi_dung');
const { guiThatBai } = require('../utils/phan_hoi_api');

const xacThuc = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return guiThatBai(res, {
        statusCode: 401,
        message: 'Vui lòng đăng nhập để tiếp tục.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret_key_quan_ly_nha_tro_2026'
    );

    const nguoiDung = await NguoiDung.findById(decoded.id).select('-matKhau');
    if (!nguoiDung) {
      return guiThatBai(res, {
        statusCode: 401,
        message: 'Tài khoản không tồn tại.',
      });
    }

    if (nguoiDung.trangThai !== 'HOAT_DONG') {
      return guiThatBai(res, {
        statusCode: 403,
        message: 'Tài khoản đã bị khóa.',
      });
    }

    req.user = nguoiDung;
    next();
  } catch (error) {
    return guiThatBai(res, {
      statusCode: 401,
      message: 'Token không hợp lệ hoặc đã hết hạn.',
    });
  }
};

const phanQuyen = (...cacVaiTro) => {
  return (req, res, next) => {
    if (!req.user || !cacVaiTro.includes(req.user.vaiTro)) {
      return guiThatBai(res, {
        statusCode: 403,
        message: 'Bạn không có quyền thực hiện thao tác này.',
      });
    }
    next();
  };
};

module.exports = { xacThuc, phanQuyen };