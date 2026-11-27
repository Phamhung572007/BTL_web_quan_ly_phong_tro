const mongoose = require('mongoose');
const HoSoOGhep = require('../models/ho_so_o_ghep');
const { guiThanhCong, guiThatBai } = require('../utils/phan_hoi_api');

// Chuẩn hóa dữ liệu từ Frontend cho khớp với schema HoSoOGhep
function chuanHoaDuLieuOGhep(body) {
  const duLieu = { ...body };
  delete duLieu.nguoiDangId;

  // hỗ trợ cả giaMongMuon lẫn nganSachToiDa / giaChiaSe
  if (duLieu.giaMongMuon === undefined || duLieu.giaMongMuon === '') {
    const gia = duLieu.nganSachToiDa ?? duLieu.giaChiaSe ?? duLieu.mucGia;
    if (gia !== undefined && gia !== '') duLieu.giaMongMuon = Number(gia);
  } else {
    duLieu.giaMongMuon = Number(duLieu.giaMongMuon);
  }

  //hỗ trợ cả thoiGianChuyenVao lẫn ngayChuyenVao
  if (!duLieu.thoiGianChuyenVao && duLieu.ngayChuyenVao) {
    duLieu.thoiGianChuyenVao = duLieu.ngayChuyenVao;
  }

  //đưa gioiTinhYeuCau và trangThai về chữ thường đúng chuẩn enum
  const gioiTinhRaw = duLieu.gioiTinhYeuCau || duLieu.yeuCauGioiTinh;
  if (typeof gioiTinhRaw === 'string') {
    duLieu.gioiTinhYeuCau = gioiTinhRaw.trim().toLowerCase();
  }
  if (typeof duLieu.trangThai === 'string') {
    duLieu.trangThai = duLieu.trangThai.trim().toLowerCase();
  }

  //nếu thoiQuenSinhHoat gửi dạng mảng thì nối thành chuỗi
  if (Array.isArray(duLieu.thoiQuenSinhHoat)) {
    duLieu.thoiQuenSinhHoat = duLieu.thoiQuenSinhHoat.join(', ');
  }

  // tránh lỗi cast ObjectId khi phongId rỗng
  if (duLieu.phongId === '') duLieu.phongId = null;

  return duLieu;
}

// GET /api/ho-so-o-ghep
const layDanhSachOGhep = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const { khuVuc, gioiTinh, giaToiDa, thoiGianChuyenVao } = req.query;
    const boLoc = { trangThai: 'dang_tim' };

    if (khuVuc) boLoc.khuVucMongMuon = { $regex: khuVuc, $options: 'i' };
    if (gioiTinh && gioiTinh.toLowerCase() !== 'khong_yeu_cau') {
      boLoc.gioiTinhYeuCau = gioiTinh.toLowerCase();
    }
    if (giaToiDa) boLoc.giaMongMuon = { $lte: Number(giaToiDa) };
    if (thoiGianChuyenVao) boLoc.thoiGianChuyenVao = { $lte: new Date(thoiGianChuyenVao) };

    let truyVan = HoSoOGhep.find(boLoc)
      .populate('nguoiDangId', 'hoTen soDienThoai anhDaiDien')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (mongoose.models.PhongTro) {
      truyVan = truyVan.populate('phongId');
    }

    const [danhSach, total] = await Promise.all([
      truyVan,
      HoSoOGhep.countDocuments(boLoc),
    ]);

    const totalPages = Math.ceil(total / limit);

    return guiThanhCong(res, {
      message: 'Lấy danh sách hồ sơ ở ghép thành công.',
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

// GET /api/ho-so-o-ghep/cua-toi
const layHoSoCuaToi = async (req, res, next) => {
  try {
    let truyVan = HoSoOGhep.findOne({ nguoiDangId: req.user._id });
    if (mongoose.models.PhongTro) {
      truyVan = truyVan.populate('phongId');
    }
    const hoSo = await truyVan;

    return guiThanhCong(res, {
      message: 'Lấy hồ sơ ở ghép cá nhân thành công.',
      data: hoSo,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/ho-so-o-ghep/:maHoSo
const layChiTietHoSoOGhep = async (req, res, next) => {
  try {
    let truyVan = HoSoOGhep.findById(req.params.maHoSo)
      .populate('nguoiDangId', 'hoTen soDienThoai anhDaiDien');

    if (mongoose.models.PhongTro) {
      truyVan = truyVan.populate('phongId');
    }

    const hoSo = await truyVan;

    if (!hoSo) {
      return guiThatBai(res, {
        statusCode: 404,
        message: 'Không tìm thấy hồ sơ ở ghép.',
      });
    }

    return guiThanhCong(res, {
      message: 'Lấy chi tiết hồ sơ ở ghép thành công.',
      data: hoSo,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ho-so-o-ghep
const taoHoSoOGhep = async (req, res, next) => {
  try {
    const duLieu = chuanHoaDuLieuOGhep(req.body);

    const hoSoMoi = await HoSoOGhep.create({
      ...duLieu,
      nguoiDangId: req.user._id,
    });

    return guiThanhCong(res, {
      statusCode: 201,
      message: 'Tạo hồ sơ tìm người ở ghép thành công.',
      data: hoSoMoi,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/ho-so-o-ghep/cua-toi
const capNhatHoSoCuaToi = async (req, res, next) => {
  try {
    const duLieu = chuanHoaDuLieuOGhep(req.body);

    const hoSo = await HoSoOGhep.findOneAndUpdate(
      { nguoiDangId: req.user._id },
      duLieu,
      { new: true, runValidators: true }
    );

    if (!hoSo) {
      return guiThatBai(res, {
        statusCode: 404,
        message: 'Bạn chưa có hồ sơ tìm ở ghép.',
      });
    }

    return guiThanhCong(res, {
      message: 'Cập nhật hồ sơ ở ghép thành công.',
      data: hoSo,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/ho-so-o-ghep/cua-toi
const xoaHoSoCuaToi = async (req, res, next) => {
  try {
    const hoSo = await HoSoOGhep.findOneAndDelete({ nguoiDangId: req.user._id });

    if (!hoSo) {
      return guiThatBai(res, {
        statusCode: 404,
        message: 'Bạn chưa có hồ sơ tìm ở ghép.',
      });
    }

    return guiThanhCong(res, { message: 'Đã gỡ hồ sơ khỏi kết quả tìm kiếm.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  layDanhSachOGhep,
  layHoSoCuaToi,
  layChiTietHoSoOGhep,
  taoHoSoOGhep,
  capNhatHoSoCuaToi,
  xoaHoSoCuaToi,
};