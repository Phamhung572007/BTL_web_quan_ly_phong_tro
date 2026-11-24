const TinDangPhong = require('../models/tin_dang_phong');
const PhongTro = require('../models/phong_tro');
const DayTro = require('../models/day_tro');

// [GET] /api/tin-dang - Tìm kiếm tin công khai hoặc danh sách tin theo chủ trọ
const layDanhSachTinDang = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);

    const tuKhoa = (req.query['tu-khoa'] || '').trim();
    const tinh = (req.query.tinh || '').trim();
    const quan = (req.query.quan || '').trim();
    const giaTu = req.query['gia-tu'] !== undefined ? Number(req.query['gia-tu']) : null;
    const giaDen = req.query['gia-den'] !== undefined ? Number(req.query['gia-den']) : null;
    const dienTichTu = req.query['dien-tich-tu'] !== undefined ? Number(req.query['dien-tich-tu']) : null;
    const dienTichDen = req.query['dien-tich-den'] !== undefined ? Number(req.query['dien-tich-den']) : null;
    const lat = req.query.lat !== undefined ? Number(req.query.lat) : null;
    const lng = req.query.lng !== undefined ? Number(req.query.lng) : null;
    const banKinhKm = req.query['ban-kinh-km'] !== undefined ? Number(req.query['ban-kinh-km']) : null;
    const sapXep = req.query['sap-xep'] || 'moi-nhat';
    const { chuTroId, trangThai } = req.query;

    const filter = {};

    // Nếu xem theo chủ trọ quản lý thì lấy theo chuTroId; ngược lại chỉ trả tin công khai của phòng còn trống
    if (chuTroId) {
      filter.chuTroId = chuTroId;
      if (trangThai) filter.trangThai = trangThai;
    } else {
      filter.trangThai = 'DANG_HIEN_THI';
      const phongTrongIds = await PhongTro.find({ trangThai: 'TRONG' }).distinct('_id');
      filter.phongTroId = { $in: phongTrongIds };
    }

    if (tuKhoa) {
      filter.$or = [
        { tieuDe: { $regex: tuKhoa, $options: 'i' } },
        { moTaChiTiet: { $regex: tuKhoa, $options: 'i' } },
        { 'khuVuc.diaChiDayDu': { $regex: tuKhoa, $options: 'i' } },
      ];
    }

    if (tinh) filter['khuVuc.tinhThanh'] = { $regex: tinh, $options: 'i' };
    if (quan) filter['khuVuc.quanHuyen'] = { $regex: quan, $options: 'i' };

    if ((giaTu !== null && !Number.isNaN(giaTu)) || (giaDen !== null && !Number.isNaN(giaDen))) {
      filter.giaChoThue = {};
      if (giaTu !== null && !Number.isNaN(giaTu)) filter.giaChoThue.$gte = giaTu;
      if (giaDen !== null && !Number.isNaN(giaDen)) filter.giaChoThue.$lte = giaDen;
    }

    if ((dienTichTu !== null && !Number.isNaN(dienTichTu)) || (dienTichDen !== null && !Number.isNaN(dienTichDen))) {
      filter.dienTich = {};
      if (dienTichTu !== null && !Number.isNaN(dienTichTu)) filter.dienTich.$gte = dienTichTu;
      if (dienTichDen !== null && !Number.isNaN(dienTichDen)) filter.dienTich.$lte = dienTichDen;
    }

    // Lọc theo tọa độ bản đồ và bán kính (km)
    if (
      lat !== null &&
      lng !== null &&
      banKinhKm !== null &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng) &&
      !Number.isNaN(banKinhKm) &&
      banKinhKm > 0
    ) {
      const banKinhRadian = banKinhKm / 6378.1;
      filter.viTri = {
        $geoWithin: {
          $centerSphere: [[lng, lat], banKinhRadian],
        },
      };
    }

    let sortOption = { noiBat: -1, createdAt: -1 };
    if (sapXep === 'gia-tang') sortOption = { giaChoThue: 1 };
    else if (sapXep === 'gia-giam') sortOption = { giaChoThue: -1 };
    else if (sapXep === 'dien-tich-giam') sortOption = { dienTich: -1 };

    const total = await TinDangPhong.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const danhSach = await TinDangPhong.find(filter)
      .populate('phongTroId', 'soPhong tang noiThat soNguoiToiDa trangThai')
      .populate('dayTroId', 'tenDayTro diaChi tienIchChung')
      .populate('chuTroId', 'hoTen soDienThoai')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách tin đăng thành công.',
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

// [GET] /api/tin-dang/:maTinDang - Xem chi tiết tin đăng công khai
const layChiTietTinDang = async (req, res, next) => {
  try {
    const tinDang = await TinDangPhong.findByIdAndUpdate(
      req.params.maTinDang,
      { $inc: { luotXem: 1 } },
      { new: true }
    )
      .populate('phongTroId', 'soPhong tang giaThue tienCocMacDinh dienTich soNguoiToiDa noiThat trangThai')
      .populate('dayTroId', 'tenDayTro diaChi tienIchChung quyDinhChung viTri')
      .populate('chuTroId', 'hoTen soDienThoai email')
      .lean();

    if (!tinDang) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng.', data: null });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy chi tiết tin đăng thành công.',
      data: tinDang,
    });
  } catch (error) {
    next(error);
  }
};

// [POST] /api/tin-dang - Chủ trọ tạo tin đăng gắn với phòng
const taoTinDang = async (req, res, next) => {
  try {
    const { phongTroId, tieuDe, moTaChiTiet, giaChoThue, dienTich, hinhAnh, soDienThoaiLienHe } = req.body;

    if (!phongTroId || !tieuDe || !moTaChiTiet || !soDienThoaiLienHe || !Array.isArray(hinhAnh) || hinhAnh.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ phòng, tiêu đề, mô tả, số điện thoại liên hệ và ít nhất 1 hình ảnh.',
        data: null,
      });
    }

    const phong = await PhongTro.findById(phongTroId);
    if (!phong) {
      return res.status(404).json({ success: false, message: 'Phòng trọ không tồn tại.', data: null });
    }
    if (String(phong.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không sở hữu phòng trọ này.', data: null });
    }
    if (phong.trangThai !== 'TRONG') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể đăng tin cho thuê đối với phòng đang ở trạng thái Trống.',
        data: null,
      });
    }

    const dayTro = await DayTro.findById(phong.dayTroId);
    const diaChiDayDu = dayTro
      ? [dayTro.diaChi?.soNhaDuong, dayTro.diaChi?.phuongXa, dayTro.diaChi?.quanHuyen, dayTro.diaChi?.tinhThanh]
          .filter(Boolean)
          .join(', ')
      : '';

    const tinMoi = await TinDangPhong.create({
      chuTroId: req.user._id,
      phongTroId: phong._id,
      dayTroId: phong.dayTroId,
      tieuDe: tieuDe.trim(),
      moTaChiTiet: moTaChiTiet.trim(),
      giaChoThue: giaChoThue !== undefined ? Number(giaChoThue) : phong.giaThue,
      dienTich: dienTich !== undefined ? Number(dienTich) : phong.dienTich,
      hinhAnh,
      khuVuc: {
        diaChiDayDu,
        quanHuyen: dayTro?.diaChi?.quanHuyen || '',
        tinhThanh: dayTro?.diaChi?.tinhThanh || '',
      },
      viTri: dayTro?.viTri || { type: 'Point', coordinates: [105.8342, 21.0278] },
      soDienThoaiLienHe: soDienThoaiLienHe.trim(),
      trangThai: 'DANG_HIEN_THI',
    });

    return res.status(201).json({
      success: true,
      message: 'Đăng tin cho thuê thành công.',
      data: tinMoi,
    });
  } catch (error) {
    next(error);
  }
};

// [PUT] /api/tin-dang/:maTinDang - Chủ tin cập nhật nội dung tin
const capNhatTinDang = async (req, res, next) => {
  try {
    const tinDang = await TinDangPhong.findById(req.params.maTinDang);
    if (!tinDang) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng.', data: null });
    }
    if (String(tinDang.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa tin đăng này.', data: null });
    }

    const { tieuDe, moTaChiTiet, giaChoThue, dienTich, hinhAnh, soDienThoaiLienHe } = req.body;

    if (tieuDe !== undefined) tinDang.tieuDe = tieuDe.trim();
    if (moTaChiTiet !== undefined) tinDang.moTaChiTiet = moTaChiTiet.trim();
    if (giaChoThue !== undefined) tinDang.giaChoThue = Number(giaChoThue);
    if (dienTich !== undefined) tinDang.dienTich = Number(dienTich);
    if (Array.isArray(hinhAnh) && hinhAnh.length > 0) tinDang.hinhAnh = hinhAnh;
    if (soDienThoaiLienHe !== undefined) tinDang.soDienThoaiLienHe = soDienThoaiLienHe.trim();

    await tinDang.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật tin đăng thành công.',
      data: tinDang,
    });
  } catch (error) {
    next(error);
  }
};

// [PATCH] /api/tin-dang/:maTinDang/trang-thai - Đăng hiển thị hoặc ẩn tin
const doiTrangThaiTinDang = async (req, res, next) => {
  try {
    const tinDang = await TinDangPhong.findById(req.params.maTinDang);
    if (!tinDang) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng.', data: null });
    }
    if (String(tinDang.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thay đổi trạng thái tin này.', data: null });
    }

    const trangThaiMoi =
      req.body?.trangThai || (tinDang.trangThai === 'DANG_HIEN_THI' ? 'DA_AN' : 'DANG_HIEN_THI');

    if (!['DANG_HIEN_THI', 'DA_AN'].includes(trangThaiMoi)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái tin chỉ nhận DANG_HIEN_THI hoặc DA_AN.',
        data: null,
      });
    }

    // Nếu bật hiển thị tin thì kiểm tra phòng phải đang TRONG
    if (trangThaiMoi === 'DANG_HIEN_THI') {
      const phong = await PhongTro.findById(tinDang.phongTroId);
      if (!phong || phong.trangThai !== 'TRONG') {
        return res.status(400).json({
          success: false,
          message: 'Phòng gắn với tin đăng này hiện không còn trống, không thể hiển thị công khai.',
          data: null,
        });
      }
    }

    tinDang.trangThai = trangThaiMoi;
    await tinDang.save();

    return res.status(200).json({
      success: true,
      message: trangThaiMoi === 'DANG_HIEN_THI' ? 'Đã bật hiển thị tin đăng.' : 'Đã ẩn tin đăng.',
      data: tinDang,
    });
  } catch (error) {
    next(error);
  }
};

// [DELETE] /api/tin-dang/:maTinDang - Xóa tin đăng
const xoaTinDang = async (req, res, next) => {
  try {
    const tinDang = await TinDangPhong.findById(req.params.maTinDang);
    if (!tinDang) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng.', data: null });
    }
    if (String(tinDang.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa tin đăng này.', data: null });
    }

    await tinDang.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Xóa tin đăng thành công.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  layDanhSachTinDang,
  layChiTietTinDang,
  taoTinDang,
  capNhatTinDang,
  doiTrangThaiTinDang,
  xoaTinDang,
};