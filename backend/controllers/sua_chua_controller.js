const YeuCauSuaChua = require('../models/yeu_cau_sua_chua');
const { guiThanhCong, guiThatBai } = require('../utils/phan_hoi_api');

// GET /api/yeu-cau-sua-chua
const layDanhSachSuaChua = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const dieuKien = req.user.vaiTro === 'CHU_TRO'
      ? { chuTroId: req.user._id }
      : { nguoiGuiId: req.user._id };

    const [danhSach, total] = await Promise.all([
      YeuCauSuaChua.find(dieuKien)
        .populate('phongId')
        .populate('nguoiGuiId', 'hoTen soDienThoai')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      YeuCauSuaChua.countDocuments(dieuKien),
    ]);

    const totalPages = Math.ceil(total / limit);

    return guiThanhCong(res, {
      message: 'Lấy danh sách yêu cầu sửa chữa thành công.',
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

// GET /api/yeu-cau-sua-chua/:maYeuCau
const layChiTietSuaChua = async (req, res, next) => {
  try {
    const yeuCau = await YeuCauSuaChua.findById(req.params.maYeuCau)
      .populate('phongId')
      .populate('nguoiGuiId', 'hoTen soDienThoai');

    if (!yeuCau) {
      return guiThatBai(res, {
        statusCode: 404,
        message: 'Không tìm thấy yêu cầu sửa chữa.',
      });
    }

    const laChuTro = String(yeuCau.chuTroId) === String(req.user._id);
    const laNguoiGui = String(yeuCau.nguoiGuiId._id) === String(req.user._id);

    if (!laChuTro && !laNguoiGui && req.user.vaiTro !== 'ADMIN') {
      return guiThatBai(res, {
        statusCode: 403,
        message: 'Bạn không có quyền xem yêu cầu sửa chữa này.',
      });
    }

    return guiThanhCong(res, {
      message: 'Lấy chi tiết yêu cầu sửa chữa thành công.',
      data: yeuCau,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/yeu-cau-sua-chua
const taoYeuCauSuaChua = async (req, res, next) => {
  try {
    const yeuCauMoi = await YeuCauSuaChua.create({
      ...req.body,
      nguoiGuiId: req.user._id,
    });

    return guiThanhCong(res, {
      statusCode: 201,
      message: 'Gửi yêu cầu sửa chữa thành công.',
      data: yeuCauMoi,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/yeu-cau-sua-chua/:maYeuCau/trang-thai
const capNhatTrangThaiSuaChua = async (req, res, next) => {
  try {
    const { trangThai, phanHoiChuTro, chiPhiSuaChua } = req.body;

    const yeuCau = await YeuCauSuaChua.findOneAndUpdate(
      { _id: req.params.maYeuCau, chuTroId: req.user._id },
      { trangThai, phanHoiChuTro, chiPhiSuaChua },
      { new: true, runValidators: true }
    );

    if (!yeuCau) {
      return guiThatBai(res, {
        statusCode: 404,
        message: 'Không tìm thấy yêu cầu sửa chữa hoặc bạn không có quyền cập nhật.',
      });
    }

    return guiThanhCong(res, {
      message: 'Cập nhật trạng thái sửa chữa thành công.',
      data: yeuCau,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  layDanhSachSuaChua,
  layChiTietSuaChua,
  taoYeuCauSuaChua,
  capNhatTrangThaiSuaChua,
};