const jwt = require('jsonwebtoken');
const NguoiDung = require('../models/nguoi_dung');

// middleware kiểm tra đăng nhập JWT
const xacThuc = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập, vui lòng đăng nhập!',
        data: null,
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret_key_quan_ly_nha_tro_2026'
    );

    //lấy thông tin user mới nhất từ DB bỏ trường mật khẩu
    const nguoiDung = await NguoiDung.findById(decoded.id).select('-matKhau');

    if (!nguoiDung) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại trong hệ thống.',
        data: null,
      });
    }

    if (!nguoiDung.trangThai) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa.',
        data: null,
      });
    }

    req.user = nguoiDung;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
      data: null,
    });
  }
};

// middleware phân quyền theo vai trò
// router.post('/...', xacThuc, phanQuyen('chu_tro', 'admin'), controller)
const phanQuyen = (...cacVaiTroHopLe) => {
  return (req, res, next) => {
    if (!req.user || !cacVaiTroHopLe.includes(req.user.vaiTro)) {
      return res.status(403).json({
        success: false,
        message: `Tài khoản với vai trò (${req.user?.vaiTro || 'khách'}) không có quyền thực hiện thao tác này.`,
        data: null,
      });
    }
    next();
  };
};

module.exports = { xacThuc, phanQuyen };