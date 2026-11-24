const DayTro = require('../models/day_tro');
const PhongTro = require('../models/phong_tro');


const layDanhSachDayTro = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
    const tuKhoa = (req.query['tu-khoa'] || '').trim();

    const filter = { chuTroId: req.user._id };
    if (tuKhoa) {
      filter.$or = [
        { tenDayTro: { $regex: tuKhoa, $options: 'i' } },
        { 'diaChi.soNhaDuong': { $regex: tuKhoa, $options: 'i' } },
        { 'diaChi.quanHuyen': { $regex: tuKhoa, $options: 'i' } },
        { 'diaChi.tinhThanh': { $regex: tuKhoa, $options: 'i' } },
      ];
    }

    const total = await DayTro.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const danhSach = await DayTro.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

   
    const dayTroIds = danhSach.map((d) => d._id);
    const thongKePhong = await PhongTro.aggregate([
      { $match: { dayTroId: { $in: dayTroIds } } },
      {
        $group: {
          _id: '$dayTroId',
          tongSoPhong: { $sum: 1 },
          soPhongTrong: { $sum: { $cond: [{ $eq: ['$trangThai', 'TRONG'] }, 1, 0] } },
          soPhongDangO: { $sum: { $cond: [{ $eq: ['$trangThai', 'DANG_O'] }, 1, 0] } },
        },
      },
    ]);

    const mapThongKe = new Map(thongKePhong.map((item) => [String(item._id), item]));
    const duLieuTraVe = danhSach.map((day) => {
      const tk = mapThongKe.get(String(day._id)) || {
        tongSoPhong: 0,
        soPhongTrong: 0,
        soPhongDangO: 0,
      };
      return { ...day, ...tk };
    });

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách dãy trọ thành công.',
      data: duLieuTraVe,
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


const layChiTietDayTro = async (req, res, next) => {
  try {
    const dayTro = await DayTro.findById(req.params.maDayTro).lean();
    if (!dayTro) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dãy trọ.', data: null });
    }
    if (String(dayTro.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem dãy trọ này.', data: null });
    }

    const danhSachPhong = await PhongTro.find({ dayTroId: dayTro._id }).sort({ tang: 1, soPhong: 1 }).lean();

    return res.status(200).json({
      success: true,
      message: 'Lấy chi tiết dãy trọ thành công.',
      data: { ...dayTro, danhSachPhong },
    });
  } catch (error) {
    next(error);
  }
};


const taoDayTro = async (req, res, next) => {
  try {
    const { tenDayTro, diaChi, lat, lng, moTa, quyDinhChung, tienIchChung, anhDaiDien } = req.body;

    if (!tenDayTro || !diaChi?.soNhaDuong || !diaChi?.quanHuyen || !diaChi?.tinhThanh) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên dãy trọ và địa chỉ (số nhà/đường, quận/huyện, tỉnh/thành).',
        data: null,
      });
    }

    const coordinates =
      lat !== undefined && lng !== undefined && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))
        ? [Number(lng), Number(lat)]
        : [105.8342, 21.0278];

    const dayTroMoi = await DayTro.create({
      chuTroId: req.user._id,
      tenDayTro,
      diaChi,
      viTri: { type: 'Point', coordinates },
      moTa,
      quyDinhChung,
      tienIchChung,
      anhDaiDien,
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo dãy trọ mới thành công.',
      data: dayTroMoi,
    });
  } catch (error) {
    next(error);
  }
};


const capNhatDayTro = async (req, res, next) => {
  try {
    const dayTro = await DayTro.findById(req.params.maDayTro);
    if (!dayTro) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dãy trọ.', data: null });
    }
    if (String(dayTro.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa dãy trọ này.', data: null });
    }

    const { tenDayTro, diaChi, lat, lng, moTa, quyDinhChung, tienIchChung, anhDaiDien } = req.body;

    if (tenDayTro !== undefined) dayTro.tenDayTro = tenDayTro;
    if (diaChi !== undefined) dayTro.diaChi = { ...dayTro.diaChi.toObject(), ...diaChi };
    if (lat !== undefined && lng !== undefined && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))) {
      dayTro.viTri = { type: 'Point', coordinates: [Number(lng), Number(lat)] };
    }
    if (moTa !== undefined) dayTro.moTa = moTa;
    if (quyDinhChung !== undefined) dayTro.quyDinhChung = quyDinhChung;
    if (tienIchChung !== undefined) dayTro.tienIchChung = tienIchChung;
    if (anhDaiDien !== undefined) dayTro.anhDaiDien = anhDaiDien;

    await dayTro.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật dãy trọ thành công.',
      data: dayTro,
    });
  } catch (error) {
    next(error);
  }
};


const xoaDayTro = async (req, res, next) => {
  try {
    const dayTro = await DayTro.findById(req.params.maDayTro);
    if (!dayTro) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dãy trọ.', data: null });
    }
    if (String(dayTro.chuTroId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa dãy trọ này.', data: null });
    }

    const soPhongHienCo = await PhongTro.countDocuments({ dayTroId: dayTro._id });
    if (soPhongHienCo > 0) {
      return res.status(409).json({
        success: false,
        message: `Không thể xóa dãy trọ vì vẫn còn ${soPhongHienCo} phòng bên trong. Vui lòng xóa hết phòng trước.`,
        data: null,
      });
    }

    await dayTro.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Xóa dãy trọ thành công.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  layDanhSachDayTro,
  layChiTietDayTro,
  taoDayTro,
  capNhatDayTro,
  xoaDayTro,
};