const HopDong = require('../models/hop_dong');
const PhongTro = require('../models/phong_tro');
const TinDangPhong = require('../models/tin_dang_phong');

// [GET] /api/hop-dong - Lấy danh sách hợp đồng của chủ trọ
const layDanhSachHopDong = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
    const { trangThai, phongTroId } = req.query;
    const tuKhoa = (req.query['tu-khoa'] || '').trim();

    const filter = { chuTroId: req.user._id };
    if (trangThai) filter.trangThai = trangThai;
    if (phongTroId) filter.phongTroId = phongTroId;
    if (tuKhoa) {
      filter.maHopDongSo = { $regex: tuKhoa, $options: 'i' };
    }

    const total = await HopDong.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const danhSach = await HopDong.find(filter)
      .populate({
        path: 'phongTroId',
        select: 'soPhong tang giaThue dayTroId',
        populate: { path: 'dayTroId', select: 'tenDayTro diaChi' },
      })
      .populate('nguoiThueId', 'hoTen soDienThoai cccd email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách hợp đồng thành công.',
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

// [GET] /api/hop-dong/:maHopDong - Xem chi tiết hợp đồng
const layChiTietHopDong = async (req, res, next) => {
  try {
    const hopDong = await HopDong.findById(req.params.maHopDong)
      .populate({
        path: 'phongTroId',
        select: 'soPhong tang giaThue dienTich noiThat dayTroId',
        populate: { path: 'dayTroId', select: 'tenDayTro diaChi' },
      })
      .populate('nguoiThueId', 'hoTen soDienThoai cccd queQuan')
      .populate('danhSachNguoiO', 'hoTen soDienThoai cccd')
      .lean();

    if (!hopDong) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng.', data: null });
    }
    if (String(hopDong.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem hợp đồng này.', data: null });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy chi tiết hợp đồng thành công.',
      data: hopDong,
    });
  } catch (error) {
    next(error);
  }
};

// [POST] /api/hop-dong - Tạo hợp đồng mới & tự động chuyển phòng sang DANG_O
const taoHopDong = async (req, res, next) => {
  try {
    const {
      phongTroId,
      nguoiThueId,
      danhSachNguoiO,
      ngayBatDau,
      ngayKetThuc,
      giaThueChot,
      tienCoc,
      chuKyThanhToan,
      ngayThuTienHangThang,
      dieuKhoan,
    } = req.body;

    if (!phongTroId || !nguoiThueId || !ngayBatDau || !ngayKetThuc || giaThueChot === undefined || tienCoc === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin phòng, người thuê, thời hạn, giá thuê và tiền cọc.',
        data: null,
      });
    }

    const phong = await PhongTro.findById(phongTroId);
    if (!phong) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.', data: null });
    }
    if (String(phong.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không sở hữu phòng trọ này.', data: null });
    }

    // Quy tắc 1: Không tạo hợp đồng mới cho phòng đang có hợp đồng hiệu lực
    const dangCoHopDong = await HopDong.exists({ phongTroId: phong._id, trangThai: 'HIEU_LUC' });
    if (dangCoHopDong || phong.trangThai === 'DANG_O') {
      return res.status(409).json({
        success: false,
        message: 'Phòng này đang có hợp đồng hiệu lực hoặc đang có người ở.',
        data: null,
      });
    }

    const maHopDongSo = `HD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    const hopDongMoi = await HopDong.create({
      chuTroId: req.user._id,
      phongTroId: phong._id,
      nguoiThueId,
      danhSachNguoiO: danhSachNguoiO || [nguoiThueId],
      maHopDongSo,
      ngayBatDau,
      ngayKetThuc,
      giaThueChot,
      tienCoc,
      chuKyThanhToan: chuKyThanhToan || 1,
      ngayThuTienHangThang: ngayThuTienHangThang || 5,
      dieuKhoan: dieuKhoan || '',
      trangThai: 'HIEU_LUC',
    });

    // Quy tắc 2: Tự động cập nhật trạng thái phòng sang DANG_O & ẩn tin đăng công khai
    phong.trangThai = 'DANG_O';
    await phong.save();
    await TinDangPhong.updateMany({ phongTroId: phong._id }, { $set: { trangThai: 'DA_AN' } });

    return res.status(201).json({
      success: true,
      message: 'Tạo hợp đồng mới thành công.',
      data: hopDongMoi,
    });
  } catch (error) {
    next(error);
  }
};

// [PUT] /api/hop-dong/:maHopDong - Cập nhật / Gia hạn hợp đồng
const capNhatHopDong = async (req, res, next) => {
  try {
    const hopDong = await HopDong.findById(req.params.maHopDong);
    if (!hopDong) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng.', data: null });
    }
    if (String(hopDong.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa hợp đồng này.', data: null });
    }
    if (hopDong.trangThai !== 'HIEU_LUC') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể cập nhật hoặc gia hạn hợp đồng đang còn hiệu lực.',
        data: null,
      });
    }

    const {
      ngayKetThuc,
      giaThueChot,
      tienCoc,
      chuKyThanhToan,
      ngayThuTienHangThang,
      dieuKhoan,
      danhSachNguoiO,
    } = req.body;

    if (ngayKetThuc !== undefined) hopDong.ngayKetThuc = ngayKetThuc;
    if (giaThueChot !== undefined) hopDong.giaThueChot = giaThueChot;
    if (tienCoc !== undefined) hopDong.tienCoc = tienCoc;
    if (chuKyThanhToan !== undefined) hopDong.chuKyThanhToan = chuKyThanhToan;
    if (ngayThuTienHangThang !== undefined) hopDong.ngayThuTienHangThang = ngayThuTienHangThang;
    if (dieuKhoan !== undefined) hopDong.dieuKhoan = dieuKhoan;
    if (danhSachNguoiO !== undefined) hopDong.danhSachNguoiO = danhSachNguoiO;

    await hopDong.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật hợp đồng thành công.',
      data: hopDong,
    });
  } catch (error) {
    next(error);
  }
};

// [PATCH] /api/hop-dong/:maHopDong/ket-thuc - Thanh lý / Kết thúc hợp đồng & trả phòng về TRONG
const ketThucHopDong = async (req, res, next) => {
  try {
    const hopDong = await HopDong.findById(req.params.maHopDong);
    if (!hopDong) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng.', data: null });
    }
    if (String(hopDong.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thao tác trên hợp đồng này.', data: null });
    }
    if (hopDong.trangThai !== 'HIEU_LUC') {
      return res.status(400).json({
        success: false,
        message: 'Hợp đồng này đã kết thúc hoặc đã bị hủy trước đó.',
        data: null,
      });
    }

    hopDong.trangThai = 'DA_KET_THUC';
    hopDong.ngayThanhLyThucTe = new Date();
    hopDong.ghiChuThanhLy = req.body?.ghiChuThanhLy || '';
    await hopDong.save();

    // Tự động chuyển trạng thái phòng về TRONG
    await PhongTro.findByIdAndUpdate(hopDong.phongTroId, { $set: { trangThai: 'TRONG' } });

    return res.status(200).json({
      success: true,
      message: 'Thanh lý hợp đồng thành công. Phòng đã được chuyển về trạng thái Trống.',
      data: hopDong,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  layDanhSachHopDong,
  layChiTietHopDong,
  taoHopDong,
  capNhatHopDong,
  ketThucHopDong,
};