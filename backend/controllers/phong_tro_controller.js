const PhongTro = require('../models/phong_tro');
const DayTro = require('../models/day_tro');
const HopDong = require('../models/hop_dong');
const TinDangPhong = require('../models/tin_dang_phong');


const layDanhSachPhongTro = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
    const { dayTroId, trangThai } = req.query;
    const tuKhoa = (req.query['tu-khoa'] || '').trim();

    const filter = { chuTroId: req.user._id };
    if (dayTroId) filter.dayTroId = dayTroId;
    if (trangThai) filter.trangThai = trangThai;
    if (tuKhoa) {
      filter.soPhong = { $regex: tuKhoa, $options: 'i' };
    }

    const total = await PhongTro.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const danhSach = await PhongTro.find(filter)
      .populate('dayTroId', 'tenDayTro diaChi')
      .sort({ dayTroId: 1, tang: 1, soPhong: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách phòng trọ thành công.',
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


const layChiTietPhongTro = async (req, res, next) => {
  try {
    const phong = await PhongTro.findById(req.params.maPhong)
      .populate('dayTroId', 'tenDayTro diaChi tienIchChung quyDinhChung')
      .lean();

    if (!phong) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.', data: null });
    }
    if (String(phong.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem phòng trọ này.', data: null });
    }

    const hopDongHieuLuc = await HopDong.findOne({ phongTroId: phong._id, trangThai: 'HIEU_LUC' })
      .populate('nguoiThueId', 'hoTen soDienThoai cccd')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Lấy chi tiết phòng trọ thành công.',
      data: { ...phong, hopDongHieuLuc },
    });
  } catch (error) {
    next(error);
  }
};


const taoPhongTro = async (req, res, next) => {
  try {
    const {
      dayTroId,
      soPhong,
      tang,
      giaThue,
      tienCocMacDinh,
      dienTich,
      soNguoiToiDa,
      noiThat,
      hinhAnh,
      moTa,
      trangThai,
    } = req.body;

    if (!dayTroId || !soPhong || giaThue === undefined || dienTich === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: dãy trọ, số phòng, giá thuê và diện tích.',
        data: null,
      });
    }

    const dayTro = await DayTro.findById(dayTroId);
    if (!dayTro) {
      return res.status(404).json({ success: false, message: 'Dãy trọ không tồn tại.', data: null });
    }
    if (String(dayTro.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không sở hữu dãy trọ này.', data: null });
    }

    const phongTonTai = await PhongTro.findOne({ dayTroId, soPhong: soPhong.trim() });
    if (phongTonTai) {
      return res.status(409).json({
        success: false,
        message: `Phòng "${soPhong}" đã tồn tại trong dãy trọ này.`,
        data: null,
      });
    }

    const phongMoi = await PhongTro.create({
      chuTroId: req.user._id,
      dayTroId,
      soPhong: soPhong.trim(),
      tang,
      giaThue,
      tienCocMacDinh,
      dienTich,
      soNguoiToiDa,
      noiThat,
      hinhAnh,
      moTa,
      trangThai: trangThai || 'TRONG',
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm phòng trọ mới thành công.',
      data: phongMoi,
    });
  } catch (error) {
    next(error);
  }
};


const capNhatPhongTro = async (req, res, next) => {
  try {
    const phong = await PhongTro.findById(req.params.maPhong);
    if (!phong) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.', data: null });
    }
    if (String(phong.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa phòng này.', data: null });
    }

    const {
      soPhong,
      tang,
      giaThue,
      tienCocMacDinh,
      dienTich,
      soNguoiToiDa,
      noiThat,
      hinhAnh,
      moTa,
      trangThai,
    } = req.body;

    if (soPhong !== undefined && soPhong.trim() !== phong.soPhong) {
      const trungSoPhong = await PhongTro.findOne({
        dayTroId: phong.dayTroId,
        soPhong: soPhong.trim(),
        _id: { $ne: phong._id },
      });
      if (trungSoPhong) {
        return res.status(409).json({
          success: false,
          message: `Số phòng "${soPhong}" đã tồn tại trong dãy trọ này.`,
          data: null,
        });
      }
      phong.soPhong = soPhong.trim();
    }

    
    if (trangThai !== undefined && trangThai !== phong.trangThai) {
      if (trangThai !== 'DANG_O') {
        const coHopDong = await HopDong.exists({ phongTroId: phong._id, trangThai: 'HIEU_LUC' });
        if (coHopDong) {
          return res.status(409).json({
            success: false,
            message: 'Phòng đang có hợp đồng hiệu lực. Vui lòng kết thúc hợp đồng trước khi đổi trạng thái phòng.',
            data: null,
          });
        }
      }
      phong.trangThai = trangThai;
    }

    if (tang !== undefined) phong.tang = tang;
    if (giaThue !== undefined) phong.giaThue = giaThue;
    if (tienCocMacDinh !== undefined) phong.tienCocMacDinh = tienCocMacDinh;
    if (dienTich !== undefined) phong.dienTich = dienTich;
    if (soNguoiToiDa !== undefined) phong.soNguoiToiDa = soNguoiToiDa;
    if (noiThat !== undefined) phong.noiThat = noiThat;
    if (hinhAnh !== undefined) phong.hinhAnh = hinhAnh;
    if (moTa !== undefined) phong.moTa = moTa;

    await phong.save();

    
    if (phong.trangThai !== 'TRONG') {
      await TinDangPhong.updateMany({ phongTroId: phong._id }, { $set: { trangThai: 'DA_AN' } });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật phòng trọ thành công.',
      data: phong,
    });
  } catch (error) {
    next(error);
  }
};


const xoaPhongTro = async (req, res, next) => {
  try {
    const phong = await PhongTro.findById(req.params.maPhong);
    if (!phong) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.', data: null });
    }
    if (String(phong.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa phòng trọ này.', data: null });
    }

    const coHopDongHieuLuc = await HopDong.exists({ phongTroId: phong._id, trangThai: 'HIEU_LUC' });
    if (phong.trangThai === 'DANG_O' || coHopDongHieuLuc) {
      return res.status(409).json({
        success: false,
        message: 'Không thể xóa phòng đang có người ở hoặc hợp đồng còn hiệu lực.',
        data: null,
      });
    }

    await TinDangPhong.deleteMany({ phongTroId: phong._id });
    await phong.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Xóa phòng trọ thành công.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};


const layDanhSachPhongTrong = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);

    const filter = { trangThai: 'TRONG' };
    if (req.query.dayTroId) {
      filter.dayTroId = req.query.dayTroId;
    }

    const total = await PhongTro.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const danhSach = await PhongTro.find(filter)
      .select('soPhong tang giaThue tienCocMacDinh dienTich soNguoiToiDa noiThat hinhAnh dayTroId chuTroId')
      .populate('dayTroId', 'tenDayTro diaChi tienIchChung')
      .populate('chuTroId', 'hoTen soDienThoai')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách phòng trống thành công.',
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

module.exports = {
  layDanhSachPhongTro,
  layChiTietPhongTro,
  taoPhongTro,
  capNhatPhongTro,
  xoaPhongTro,
  layDanhSachPhongTrong,
};