const HopDong = require('../models/hop_dong');
const PhongTro = require('../models/phong_tro');
const TinDangPhong = require('../models/tin_dang_phong');

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
    if (phong.trangThai === 'BAO_TRI') {
      return res.status(409).json({
        success: false,
        message: 'Không thể lập hợp đồng cho phòng đang bảo trì.',
        data: null,
      });
    }

    const dangCoHopDong = await HopDong.exists({ phongTroId: phong._id, trangThai: 'HIEU_LUC' });
    if (dangCoHopDong || phong.trangThai === 'DANG_O') {
      return res.status(409).json({
        success: false,
        message: 'Phòng này đang có hợp đồng hiệu lực hoặc đang có người ở.',
        data: null,
      });
    }
    if (phong.trangThai !== 'TRONG') {
      return res.status(409).json({
        success: false,
        message: 'Chỉ có thể lập hợp đồng cho phòng đang trống.',
        data: null,
      });
    }

    // Giữ phòng bằng cập nhật có điều kiện để hai yêu cầu đồng thời không cùng lập hợp đồng.
    const phongDaGiu = await PhongTro.findOneAndUpdate(
      { _id: phong._id, chuTroId: req.user._id, trangThai: 'TRONG' },
      { $set: { trangThai: 'DANG_O' } },
      { new: true, runValidators: true }
    );
    if (!phongDaGiu) {
      return res.status(409).json({
        success: false,
        message: 'Phòng vừa được giữ hoặc thay đổi trạng thái. Vui lòng tải lại danh sách phòng.',
        data: null,
      });
    }

    const randomBytes = require('crypto').randomBytes;
    const maHopDongSo = 'HD-' + new Date().getFullYear() + '-' + Date.now() + '-' +
      randomBytes(3).toString('hex').toUpperCase();

    let hopDongMoi;
    try {
      hopDongMoi = await HopDong.create({
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
    } catch (error) {
      const hopDongHieuLuc = await HopDong.exists({
        phongTroId: phong._id,
        trangThai: 'HIEU_LUC',
      });

      if (!hopDongHieuLuc) {
        await PhongTro.updateOne(
          { _id: phong._id, chuTroId: req.user._id, trangThai: 'DANG_O' },
          { $set: { trangThai: 'TRONG' } }
        );
      }

      if (error?.code === 11000) {
        return res.status(409).json({
          success: false,
          message: hopDongHieuLuc
            ? 'Phòng đã có hợp đồng hiệu lực.'
            : 'Mã hợp đồng bị trùng. Vui lòng thử tạo lại.',
          data: null,
        });
      }
      throw error;
    }

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