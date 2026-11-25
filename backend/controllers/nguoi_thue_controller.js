const NguoiThue = require('../models/nguoi_thue');
const { guiThanhCong, guiThatBai } = require('../utils/phan_hoi_api');

// GET /api/nguoi-thue (Chủ trọ xem toàn bộ khách thuê; Khách thuê xem hồ sơ thuê trọ của chính mình)
const layDanhSachNguoiThue = async (req, res, next) => {
  try {
    const dieuKien = req.user.vaiTro === 'khach_thue'
      ? { nguoiDungId: req.user._id }
      : { chuTroId: req.user._id };

    const danhSach = await NguoiThue.find(dieuKien)
      .populate('phongId')
      .populate('nguoiDungId', 'hoTen email soDienThoai anhDaiDien')
      .sort({ createdAt: -1 });

    return guiThanhCong(res, {
      message: 'Lấy danh sách hồ sơ người thuê thành công.',
      data: danhSach,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/nguoi-thue/:id
const layChiTietNguoiThue = async (req, res, next) => {
  try {
    const hoSo = await NguoiThue.findById(req.params.id)
      .populate('phongId')
      .populate('nguoiDungId', 'hoTen email soDienThoai');

    if (!hoSo) {
      return guiThatBai(res, { statusCode: 404, message: 'Không tìm thấy hồ sơ người thuê.' });
    }

    return guiThanhCong(res, {
      message: 'Lấy chi tiết người thuê thành công.',
      data: hoSo,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/nguoi-thue (Chủ trọ thêm hồ sơ người thuê / tạm trú)
const taoNguoiThue = async (req, res, next) => {
  try {
    const hoSoMoi = await NguoiThue.create({
      ...req.body,
      chuTroId: req.user._id,
    });

    return guiThanhCong(res, {
      statusCode: 201,
      message: 'Thêm hồ sơ người thuê thành công.',
      data: hoSoMoi,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/nguoi-thue/:id (Chủ trọ cập nhật hồ sơ / trạng thái tạm trú)
const capNhatNguoiThue = async (req, res, next) => {
  try {
    const hoSo = await NguoiThue.findOneAndUpdate(
      { _id: req.params.id, chuTroId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!hoSo) {
      return guiThatBai(res, { statusCode: 404, message: 'Không tìm thấy hồ sơ người thuê.' });
    }

    return guiThanhCong(res, {
      message: 'Cập nhật hồ sơ người thuê thành công.',
      data: hoSo,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/nguoi-thue/:id
const xoaNguoiThue = async (req, res, next) => {
  try {
    const hoSo = await NguoiThue.findOneAndDelete({
      _id: req.params.id,
      chuTroId: req.user._id,
    });

    if (!hoSo) {
      return guiThatBai(res, { statusCode: 404, message: 'Không tìm thấy hồ sơ người thuê.' });
    }

    return guiThanhCong(res, { message: 'Đã xóa hồ sơ người thuê.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  layDanhSachNguoiThue,
  layChiTietNguoiThue,
  taoNguoiThue,
  capNhatNguoiThue,
  xoaNguoiThue,
};