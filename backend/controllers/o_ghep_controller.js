const HoSoOGhep = require('../models/ho_so_o_ghep');
const { guiThanhCong, guiThatBai } = require('../utils/phan_hoi_api');

// GET /api/ho-so-o-ghep (Công khai: Xem và lọc danh sách ở ghép)
const layDanhSachOGhep = async (req, res, next) => {
  try {
    const { khuVuc, gioiTinh, giaToiDa } = req.query;
    const boLoc = { trangThai: 'dang_tim' };

    if (khuVuc) boLoc.khuVucMongMuon = { $regex: khuVuc, $options: 'i' };
    if (gioiTinh && gioiTinh !== 'khong_yeu_cau') boLoc.gioiTinhYeuCau = gioiTinh;
    if (giaToiDa) boLoc.giaMongMuon = { $lte: Number(giaToiDa) };

    const danhSach = await HoSoOGhep.find(boLoc)
      .populate('nguoiDangId', 'hoTen soDienThoai anhDaiDien')
      .populate('phongId')
      .sort({ createdAt: -1 });

    return guiThanhCong(res, {
      message: 'Lấy danh sách hồ sơ ở ghép thành công.',
      data: danhSach,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ho-so-o-ghep (Tạo tin tìm ở ghép)
const taoHoSoOGhep = async (req, res, next) => {
  try {
    const hoSoMoi = await HoSoOGhep.create({
      ...req.body,
      nguoiDangId: req.user._id,
    });

    return guiThanhCong(res, {
      statusCode: 201,
      message: 'Đăng hồ sơ tìm ở ghép thành công.',
      data: hoSoMoi,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/ho-so-o-ghep/:id (Cập nhật hồ sơ của bản thân)
const capNhatHoSoOGhep = async (req, res, next) => {
  try {
    const hoSo = await HoSoOGhep.findOneAndUpdate(
      { _id: req.params.id, nguoiDangId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!hoSo) {
      return guiThatBai(res, { statusCode: 404, message: 'Không tìm thấy hồ sơ hoặc bạn không có quyền sửa.' });
    }

    return guiThanhCong(res, {
      message: 'Cập nhật hồ sơ ở ghép thành công.',
      data: hoSo,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/ho-so-o-ghep/:id (Gỡ hồ sơ của bản thân)
const xoaHoSoOGhep = async (req, res, next) => {
  try {
    const hoSo = await HoSoOGhep.findOneAndDelete({
      _id: req.params.id,
      nguoiDangId: req.user._id,
    });

    if (!hoSo) {
      return guiThatBai(res, { statusCode: 404, message: 'Không tìm thấy hồ sơ hoặc bạn không có quyền xóa.' });
    }

    return guiThanhCong(res, { message: 'Đã gỡ hồ sơ tìm ở ghép.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  layDanhSachOGhep,
  taoHoSoOGhep,
  capNhatHoSoOGhep,
  xoaHoSoOGhep,
};