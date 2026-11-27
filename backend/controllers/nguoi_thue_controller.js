const NguoiThue = require('../models/nguoi_thue');
const { guiThanhCong, guiThatBai } = require('../utils/phan_hoi_api');

// GET /api/nguoi-thue
const layDanhSachNguoiThue = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const dieuKien = req.user.vaiTro === 'KHACH_THUE'
      ? { nguoiDungId: req.user._id }
      : { chuTroId: req.user._id };

    const [danhSach, total] = await Promise.all([
      NguoiThue.find(dieuKien)
        .populate('phongId')
        .populate('nguoiDungId', 'hoTen email soDienThoai anhDaiDien')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      NguoiThue.countDocuments(dieuKien),
    ]);

    const totalPages = Math.ceil(total / limit);

    return guiThanhCong(res, {
      message: 'Lấy danh sách hồ sơ người thuê thành công.',
      data: danhSach,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/nguoi-thue/:maNguoiThue
const layChiTietNguoiThue = async (req, res, next) => {
  try {
    const hoSo = await NguoiThue.findById(req.params.maNguoiThue)
      .populate('phongId')
      .populate('nguoiDungId', 'hoTen email soDienThoai anhDaiDien');

    if (!hoSo) {
      return guiThatBai(res, {
        statusCode: 404,
        message: 'Không tìm thấy hồ sơ người thuê.',
      });
    }

    const laChuTro = String(hoSo.chuTroId) === String(req.user._id);
    const laNguoiThue = hoSo.nguoiDungId && String(hoSo.nguoiDungId._id) === String(req.user._id);

    if (!laChuTro && !laNguoiThue && req.user.vaiTro !== 'ADMIN') {
      return guiThatBai(res, {
        statusCode: 403,
        message: 'Bạn không có quyền xem hồ sơ này.',
      });
    }

    return guiThanhCong(res, {
      message: 'Lấy chi tiết người thuê thành công.',
      data: hoSo,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/nguoi-thue
const taoNguoiThue = async (req, res, next) => {
  try {
    const duLieu = { ...req.body };
    delete duLieu.chuTroId; // Không nhận chuTroId từ client

    const hoSoMoi = await NguoiThue.create({
      ...duLieu,
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

// PUT /api/nguoi-thue/:maNguoiThue
const capNhatNguoiThue = async (req, res, next) => {
  try {
    const duLieu = { ...req.body };
    delete duLieu.chuTroId;

    const hoSo = await NguoiThue.findOneAndUpdate(
      { _id: req.params.maNguoiThue, chuTroId: req.user._id },
      duLieu,
      { new: true, runValidators: true }
    );

    if (!hoSo) {
      return guiThatBai(res, {
        statusCode: 404,
        message: 'Không tìm thấy hồ sơ người thuê hoặc bạn không có quyền sửa.',
      });
    }

    return guiThanhCong(res, {
      message: 'Cập nhật hồ sơ người thuê thành công.',
      data: hoSo,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/nguoi-thue/:maNguoiThue
const xoaNguoiThue = async (req, res, next) => {
  try {
    const hoSo = await NguoiThue.findOneAndDelete({
      _id: req.params.maNguoiThue,
      chuTroId: req.user._id,
    });

    if (!hoSo) {
      return guiThatBai(res, {
        statusCode: 404,
        message: 'Không tìm thấy hồ sơ người thuê hoặc bạn không có quyền xóa.',
      });
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