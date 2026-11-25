const TinDangPhong = require('../models/tin_dang_phong');
const PhongTro = require('../models/phong_tro');
const DayTro = require('../models/day_tro');

const TRANG_THAI_TIN_CONG_KHAI = ['DANG_HIEN_THI', 'DA_DANG'];

function themDieuKienHoac(filter, dieuKien) {
  filter.$and ||= [];
  filter.$and.push({ $or: dieuKien });
}

function chuanHoaHinhAnh(hinhAnh) {
  if (!Array.isArray(hinhAnh)) return [];
  return hinhAnh
    .map((anh) => (typeof anh === 'string' ? anh : anh?.url))
    .filter(Boolean);
}

function chuanHoaPhongTro(phong) {
  if (!phong || typeof phong !== 'object') return phong;
  return {
    ...phong,
    tenPhong: phong.tenPhong || phong.soPhong || '',
    tienCocMacDinh: phong.tienCocMacDinh ?? phong.tienCocGoiY ?? 0,
    dienTich: phong.dienTich ?? phong.dienTichM2,
    noiThat: phong.noiThat ?? phong.tienIch ?? [],
    hinhAnh: chuanHoaHinhAnh(phong.hinhAnh),
    trangThai: phong.trangThai || phong.tinhTrang,
  };
}

function chuanHoaTinDang(tin) {
  const diaChi = tin.diaChi || {};
  const khuVucCu = tin.khuVuc || {};
  const diaChiDayTro = tin.dayTroId?.diaChi || {};
  const diaChiDayDu = khuVucCu.diaChiDayDu || [
    diaChi.soNhaDuong || diaChiDayTro.soNhaDuong,
    diaChi.phuongXa || diaChiDayTro.phuongXa,
    diaChi.quanHuyen || diaChiDayTro.quanHuyen,
    diaChi.tinhThanh || diaChiDayTro.tinhThanh,
  ].filter(Boolean).join(', ');

  const dayTro = tin.dayTroId && typeof tin.dayTroId === 'object'
    ? {
        ...tin.dayTroId,
        tenDayTro: tin.dayTroId.tenDayTro || tin.dayTroId.tenDay || '',
        tienIchChung: tin.dayTroId.tienIchChung || tin.dayTroId.tienIch || [],
      }
    : tin.dayTroId;

  return {
    ...tin,
    moTaChiTiet: tin.moTaChiTiet || tin.moTa || '',
    giaChoThue: tin.giaChoThue ?? tin.giaThue ?? tin.phongTroId?.giaThue,
    dienTich: tin.dienTich ?? tin.dienTichM2 ?? tin.phongTroId?.dienTichM2,
    hinhAnh: chuanHoaHinhAnh(tin.hinhAnh),
    khuVuc: {
      ...khuVucCu,
      diaChiDayDu,
      quanHuyen: khuVucCu.quanHuyen || diaChi.quanHuyen || diaChiDayTro.quanHuyen || '',
      tinhThanh: khuVucCu.tinhThanh || diaChi.tinhThanh || diaChiDayTro.tinhThanh || '',
    },
    soDienThoaiLienHe: tin.soDienThoaiLienHe || tin.chuTroId?.soDienThoai || '',
    trangThai: tin.trangThai === 'DA_DANG' ? 'DANG_HIEN_THI' : tin.trangThai,
    phongTroId: chuanHoaPhongTro(tin.phongTroId),
    dayTroId: dayTro,
  };
}

async function layIdsPhongDangTrong() {
  return PhongTro.collection.distinct('_id', {
    $and: [
      { $or: [{ trangThai: 'TRONG' }, { tinhTrang: 'TRONG' }] },
      { hienThi: { $ne: false } },
      { daXoaLuc: null },
    ],
  });
}


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
    const cuaToi = req.query['cua-toi'] === 'true';
    const { trangThai } = req.query;

    const filter = {};

    
    if (cuaToi) {
      if (!req.user || req.user.vaiTro !== 'CHU_TRO') {
        return res.status(403).json({
          success: false,
          message: 'Bạn cần đăng nhập tài khoản Chủ trọ để xem danh sách tin của mình.',
          data: null,
        });
      }
      filter.chuTroId = req.user._id;
      if (trangThai) filter.trangThai = trangThai;
    } else {
      
      filter.trangThai = { $in: TRANG_THAI_TIN_CONG_KHAI };
      const phongTrongIds = await layIdsPhongDangTrong();
      filter.phongTroId = { $in: phongTrongIds };
    }

    if (tuKhoa) {
      filter.$or = [
        { tieuDe: { $regex: tuKhoa, $options: 'i' } },
        { moTaChiTiet: { $regex: tuKhoa, $options: 'i' } },
        { moTa: { $regex: tuKhoa, $options: 'i' } },
        { 'khuVuc.diaChiDayDu': { $regex: tuKhoa, $options: 'i' } },
        { 'diaChi.soNhaDuong': { $regex: tuKhoa, $options: 'i' } },
        { 'diaChi.phuongXa': { $regex: tuKhoa, $options: 'i' } },
        { 'diaChi.quanHuyen': { $regex: tuKhoa, $options: 'i' } },
        { 'diaChi.tinhThanh': { $regex: tuKhoa, $options: 'i' } },
      ];
    }

    if (tinh) {
      themDieuKienHoac(filter, [
        { 'khuVuc.tinhThanh': { $regex: tinh, $options: 'i' } },
        { 'diaChi.tinhThanh': { $regex: tinh, $options: 'i' } },
      ]);
    }
    if (quan) {
      themDieuKienHoac(filter, [
        { 'khuVuc.quanHuyen': { $regex: quan, $options: 'i' } },
        { 'diaChi.quanHuyen': { $regex: quan, $options: 'i' } },
      ]);
    }

    if ((giaTu !== null && !Number.isNaN(giaTu)) || (giaDen !== null && !Number.isNaN(giaDen))) {
      const khoangGia = {};
      if (giaTu !== null && !Number.isNaN(giaTu)) khoangGia.$gte = giaTu;
      if (giaDen !== null && !Number.isNaN(giaDen)) khoangGia.$lte = giaDen;
      themDieuKienHoac(filter, [
        { giaChoThue: khoangGia },
        { giaThue: khoangGia },
      ]);
    }

    if ((dienTichTu !== null && !Number.isNaN(dienTichTu)) || (dienTichDen !== null && !Number.isNaN(dienTichDen))) {
      const khoangDienTich = {};
      if (dienTichTu !== null && !Number.isNaN(dienTichTu)) khoangDienTich.$gte = dienTichTu;
      if (dienTichDen !== null && !Number.isNaN(dienTichDen)) khoangDienTich.$lte = dienTichDen;
      themDieuKienHoac(filter, [
        { dienTich: khoangDienTich },
        { dienTichM2: khoangDienTich },
      ]);
    }

    
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
    if (sapXep === 'gia-tang') sortOption = { giaChoThue: 1, giaThue: 1 };
    else if (sapXep === 'gia-giam') sortOption = { giaChoThue: -1, giaThue: -1 };
    else if (sapXep === 'dien-tich-giam') sortOption = { dienTich: -1, dienTichM2: -1 };

    const total = await TinDangPhong.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const danhSach = await TinDangPhong.find(filter)
      .populate('phongTroId', 'soPhong tenPhong tang giaThue tienCocGoiY tienCocMacDinh dienTich dienTichM2 noiThat tienIch hinhAnh soNguoiToiDa trangThai tinhTrang')
      .populate('dayTroId', 'tenDayTro tenDay diaChi tienIchChung tienIch')
      .populate('chuTroId', 'hoTen soDienThoai')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách tin đăng thành công.',
      data: danhSach.map(chuanHoaTinDang),
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


const layChiTietTinDang = async (req, res, next) => {
  try {
    const phongTrongIds = await layIdsPhongDangTrong();
    const tinDang = await TinDangPhong.findOneAndUpdate(
      {
        _id: req.params.maTinDang,
        trangThai: { $in: TRANG_THAI_TIN_CONG_KHAI },
        phongTroId: { $in: phongTrongIds },
      },
      { $inc: { luotXem: 1 } },
      { new: true }
    )
      .populate({
        path: 'phongTroId',
        select: 'soPhong tenPhong tang giaThue tienCocGoiY tienCocMacDinh dienTich dienTichM2 soNguoiToiDa noiThat tienIch hinhAnh trangThai tinhTrang',
      })
      .populate('dayTroId', 'tenDayTro tenDay diaChi tienIchChung tienIch quyDinhChung viTri')
      .populate('chuTroId', 'hoTen soDienThoai email')
      .lean();

    if (!tinDang || !tinDang.phongTroId) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng đang hiển thị.', data: null });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy chi tiết tin đăng thành công.',
      data: chuanHoaTinDang(tinDang),
    });
  } catch (error) {
    next(error);
  }
};

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
