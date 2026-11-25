const YeuCauSuaChua = require('../models/yeu_cau_sua_chua');
const { guiThanhCong, guiThatBai } = require('../utils/phan_hoi_api');

// GET /api/yeu-cau-sua-chua
const layDanhSachSuaChua = async (req, res, next) => {
  try {
    const dieuKien = req.user.vaiTro === 'chu_tro'
      ? { chuTroId: req.user._id }
      : { nguoiGuiId: req.user._id };

    const danhSach = await YeuCauSuaChua.find(dieuKien)
      .populate('phongId')
      .populate('nguoiGuiId', 'hoTen soDienThoai')
      .sort({ createdAt: -1 });

    return guiThanhCong(res, {
      message: 'Lấy danh sách yêu cầu sửa chữa thành công.',
      data: danhSach,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/yeu-cau-sua-chua (Khách thuê gửi yêu cầu)
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

// PATCH /api/yeu-cau-sua-chua/:id (Chủ trọ cập nhật trạng thái xử lý)
const capNhatTrangThaiSuaChua = async (req, res, next) => {
  try {
    const { trangThai, phanHoiChuTro, chiPhiSuaChua } = req.body;

    const yeuCau = await YeuCauSuaChua.findOneAndUpdate(
      { _id: req.params.id, chuTroId: req.user._id },
      { trangThai, phanHoiChuTro, chiPhiSuaChua },
      { new: true, runValidators: true }
    );

    if (!yeuCau) {
      return guiThatBai(res, { statusCode: 404, message: 'Không tìm thấy yêu cầu sửa chữa.' });
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
  taoYeuCauSuaChua,
  capNhatTrangThaiSuaChua,
};