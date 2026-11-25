const bcrypt = require('bcryptjs');
const NguoiDung = require('../models/nguoi_dung');
const { guiThanhCong, guiThatBai } = require('../utils/phan_hoi_api');

// GET /api/tai-khoan
const layThongTinCaNhan = async (req, res, next) => {
  try {
    return guiThanhCong(res, {
      message: 'Lấy thông tin tài khoản thành công.',
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tai-khoan
const capNhatThongTin = async (req, res, next) => {
  try {
    const { hoTen, soDienThoai, anhDaiDien } = req.body;

    const nguoiDung = await NguoiDung.findByIdAndUpdate(
      req.user._id,
      { hoTen, soDienThoai, anhDaiDien },
      { new: true, runValidators: true }
    ).select('-matKhau');

    return guiThanhCong(res, {
      message: 'Cập nhật hồ sơ thành công.',
      data: nguoiDung,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/doi-mat-khau
const doiMatKhau = async (req, res, next) => {
  try {
    const { matKhauCu, matKhauMoi } = req.body;

    if (!matKhauCu || !matKhauMoi) {
      return guiThatBai(res, { statusCode: 400, message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới.' });
    }

    const nguoiDung = await NguoiDung.findById(req.user._id);
    const khop = await bcrypt.compare(matKhauCu, nguoiDung.matKhau);

    if (!khop) {
      return guiThatBai(res, { statusCode: 400, message: 'Mật khẩu hiện tại không đúng.' });
    }

    const salt = await bcrypt.genSalt(10);
    nguoiDung.matKhau = await bcrypt.hash(matKhauMoi, salt);
    await nguoiDung.save();

    return guiThanhCong(res, { message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { layThongTinCaNhan, capNhatThongTin, doiMatKhau };