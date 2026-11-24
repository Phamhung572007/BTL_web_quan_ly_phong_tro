const mongoose = require('mongoose');
const HoaDon = require('../models/hoa_don');
const { guiThanhCong } = require('../utils/phan_hoi_api');
const { layNguoiDungId, taoLoiHttp } = require('../middleware/yeu_cau_quyen_chu_tro');
const { laySo } = require('../utils/chuan_hoa_so');
const { layPhanTrang } = require('../utils/phan_trang');

function layMocThang(nam, thang) {
  return new Date(Date.UTC(nam, thang - 1, 1));
}

async function tongQuan(req, res) {
  const chuTroId = new mongoose.Types.ObjectId(String(layNguoiDungId(req)));
  const db = mongoose.connection;
  const batDauThang = layMocThang(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1);
  const ketThucThang = layMocThang(batDauThang.getUTCFullYear(), batDauThang.getUTCMonth() + 2);
  const [rooms, unpaid, paymentTotals, pendingVisits, tenants] = await Promise.all([
    db.collection('phongtros').find({ chuTroId, daXoaLuc: null }).project({ tinhTrang: 1 }).toArray(),
    HoaDon.find({ chuTroId, trangThai: { $nin: ['DA_THANH_TOAN', 'HUY'] } }).select('tongTien daThanhToan').lean(),
    HoaDon.aggregate([
      { $match: { chuTroId, trangThai: { $ne: 'HUY' } } },
      { $unwind: '$lichSuThanhToan' },
      { $match: { 'lichSuThanhToan.thanhToanLuc': { $gte: batDauThang, $lt: ketThucThang } } },
      { $group: { _id: null, doanhThu: { $sum: '$lichSuThanhToan.soTien' } } },
    ]),
    db.collection('lichxems').countDocuments({ chuTroId, trangThai: 'CHO_XAC_NHAN' }),
    db.collection('nguoithues').countDocuments({ chuTroId, trangThai: 'DANG_O' }),
  ]);
  const occupiedRooms = rooms.filter((room) => room.tinhTrang === 'DANG_THUE').length;
  const outstanding = unpaid.reduce((sum, invoice) => sum + Math.max(0, invoice.tongTien - invoice.daThanhToan), 0);
  const revenue = paymentTotals[0]?.doanhThu || 0;
  return guiThanhCong(res, {
    message: 'Đã tải thống kê tổng quan.',
    data: {
      tongSoPhong: rooms.length,
      phongDangThue: occupiedRooms,
      phongTrong: rooms.filter((room) => room.tinhTrang === 'TRONG').length,
      phongBaoTri: rooms.filter((room) => room.tinhTrang === 'BAO_TRI').length,
      tyLeLapDay: rooms.length ? Math.round((occupiedRooms / rooms.length) * 1000) / 10 : 0,
      tongNguoiThueDangO: tenants,
      doanhThuThangNay: revenue,
      tongCongNo: outstanding,
      hoaDonConNo: unpaid.length,
      lichXemChoDuyet: pendingVisits,
    },
  });
}

async function doanhThu(req, res) {
  const nam = laySo(req.query.nam || new Date().getUTCFullYear(), 'Năm', { min: 2000, max: 2200 });
  const chuTroId = layNguoiDungId(req);
  const invoices = await HoaDon.find({ chuTroId, nam, trangThai: { $ne: 'HUY' } })
    .select('thang daThanhToan lichSuThanhToan updatedAt ngayLap').lean();
  const rows = Array.from({ length: 12 }, (_, index) => ({ thang: index + 1, doanhThu: 0, soGiaoDich: 0, soHoaDon: 0 }));
  for (const invoice of invoices) {
    const payments = invoice.lichSuThanhToan || [];
    if (payments.length) {
      for (const payment of payments) {
        const thangThanhToan = new Date(payment.thanhToanLuc || invoice.updatedAt || invoice.ngayLap).getUTCMonth();
        const namThanhToan = new Date(payment.thanhToanLuc || invoice.updatedAt || invoice.ngayLap).getUTCFullYear();
        if (namThanhToan !== nam) continue;
        rows[thangThanhToan].doanhThu += payment.soTien;
        rows[thangThanhToan].soGiaoDich += 1;
        rows[thangThanhToan].soHoaDon += 1;
      }
    } else if (invoice.daThanhToan > 0) {
      const date = new Date(invoice.updatedAt || invoice.ngayLap);
      if (date.getUTCFullYear() === nam) {
        rows[date.getUTCMonth()].doanhThu += invoice.daThanhToan;
        rows[date.getUTCMonth()].soHoaDon += 1;
      }
    }
  }
  return guiThanhCong(res, { message: `Đã tải doanh thu năm ${nam}.`, data: rows, meta: { nam, donViTien: 'VND' } });
}

async function phongNoTien(req, res) {
  const chuTroId = layNguoiDungId(req);
  const ownerObjectId = new mongoose.Types.ObjectId(String(chuTroId));
  const invoices = await HoaDon.find({
    chuTroId,
    trangThai: { $nin: ['DA_THANH_TOAN', 'HUY'] },
  }).sort({ hanThanhToan: 1 }).lean();
  const roomIds = [...new Map(invoices.map((item) => [String(item.phongTroId), item.phongTroId])).values()];
  const db = mongoose.connection;
  const [map, tenants, readings] = await Promise.all([
    require('../utils/du_lieu_phong').layPhongMap(roomIds),
    roomIds.length ? db.collection('nguoithues').find({
      chuTroId: ownerObjectId,
      phongTroId: { $in: roomIds },
      trangThai: 'DANG_O',
    }, { projection: { phongTroId: 1, hoTen: 1 } }).toArray() : [],
    roomIds.length ? db.collection('chisosdiennuocs').find({
      chuTroId: ownerObjectId,
      phongTroId: { $in: roomIds },
    }).sort({ nam: -1, thang: -1 }).toArray() : [],
  ]);
  const tenantMap = new Map();
  for (const tenant of tenants) {
    const key = String(tenant.phongTroId);
    tenantMap.set(key, [...(tenantMap.get(key) || []), tenant.hoTen].filter(Boolean));
  }
  const readingMap = new Map();
  for (const reading of readings) {
    const key = String(reading.phongTroId);
    if (!readingMap.has(key)) readingMap.set(key, reading);
  }
  const byRoom = new Map();
  for (const invoice of invoices) {
    const key = String(invoice.phongTroId);
    const existing = byRoom.get(key) || {
      phongTroId: invoice.phongTroId,
      phong: map.get(key) || null,
      nguoiThue: tenantMap.get(key) || [],
      chiSoDienNuoc: readingMap.get(key) || null,
      soHoaDonConNo: 0,
      tongCongNo: 0,
      hoaDons: [],
    };
    const conNo = Math.max(0, invoice.tongTien - invoice.daThanhToan);
    existing.soHoaDonConNo += 1;
    existing.tongCongNo += conNo;
    existing.hoaDons.push({
      _id: invoice._id,
      thang: invoice.thang,
      nam: invoice.nam,
      conNo,
      hanThanhToan: invoice.hanThanhToan,
      trangThai: invoice.trangThai,
    });
    byRoom.set(key, existing);
  }
  const data = [...byRoom.values()].sort((a, b) => b.tongCongNo - a.tongCongNo);
  return guiThanhCong(res, { message: 'Đã tải danh sách phòng còn nợ.', data, meta: { total: data.length } });
}

async function layBanDieuPhoiPhong(req, res) {
  const chuTroId = new mongoose.Types.ObjectId(String(layNguoiDungId(req)));
  const db = mongoose.connection;
  const { page, limit, skip } = layPhanTrang(req.query);
  const filter = { chuTroId, daXoaLuc: null };
  if (req.query.dayTroId) {
    if (!mongoose.Types.ObjectId.isValid(req.query.dayTroId)) throw taoLoiHttp(400, 'Mã dãy trọ không hợp lệ.');
    filter.dayTroId = new mongoose.Types.ObjectId(req.query.dayTroId);
  }
  if (req.query.tuKhoa || req.query['tu-khoa']) {
    const keyword = String(req.query.tuKhoa || req.query['tu-khoa']).trim().slice(0, 80);
    if (keyword) {
      const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ soPhong: { $regex: safeKeyword, $options: 'i' } }, { tenPhong: { $regex: safeKeyword, $options: 'i' } }];
    }
  }
  const [rooms, total] = await Promise.all([
    db.collection('phongtros').find(filter).sort({ dayTroId: 1, soPhong: 1 }).skip(skip).limit(limit).toArray(),
    db.collection('phongtros').countDocuments(filter),
  ]);
  const roomIds = rooms.map((room) => room._id);
  if (!roomIds.length) {
    return guiThanhCong(res, { message: 'Chưa có phòng để theo dõi.', data: [], meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  }
  const dayIds = [...new Map(rooms.filter((room) => room.dayTroId).map((room) => [String(room.dayTroId), room.dayTroId])).values()];
  const [buildings, tenants, readings, invoices] = await Promise.all([
    db.collection('daytros').find({ _id: { $in: dayIds }, chuTroId }, { projection: { tenDay: 1 } }).toArray(),
    db.collection('nguoithues').find({
      chuTroId, phongTroId: { $in: roomIds }, trangThai: 'DANG_O',
    }, { projection: { phongTroId: 1, hoTen: 1 } }).toArray(),
    db.collection('chisosdiennuocs').find({
      chuTroId, phongTroId: { $in: roomIds },
    }, { projection: { phongTroId: 1, thang: 1, nam: 1, ngayGhi: 1, 'dien.tieuThu': 1, 'nuoc.tieuThu': 1 } })
      .sort({ nam: -1, thang: -1, ngayGhi: -1 }).toArray(),
    HoaDon.find({ chuTroId, phongTroId: { $in: roomIds }, trangThai: { $nin: ['DA_THANH_TOAN', 'HUY'] } })
      .sort({ hanThanhToan: 1 }).select('phongTroId thang nam hanThanhToan trangThai tongTien daThanhToan').lean(),
  ]);
  const buildingMap = new Map(buildings.map((building) => [String(building._id), building.tenDay]));
  const tenantMap = new Map();
  for (const tenant of tenants) {
    const key = String(tenant.phongTroId);
    tenantMap.set(key, [...(tenantMap.get(key) || []), tenant.hoTen].filter(Boolean));
  }
  const readingMap = new Map();
  for (const reading of readings) {
    const key = String(reading.phongTroId);
    if (!readingMap.has(key)) readingMap.set(key, reading);
  }
  const invoiceMap = new Map();
  for (const invoice of invoices) {
    const key = String(invoice.phongTroId);
    const conNo = Math.max(0, invoice.tongTien - invoice.daThanhToan);
    invoiceMap.set(key, [
      ...(invoiceMap.get(key) || []),
      { _id: invoice._id, thang: invoice.thang, nam: invoice.nam, conNo, hanThanhToan: invoice.hanThanhToan, trangThai: invoice.trangThai },
    ]);
  }
  const data = rooms.map((room) => {
    const key = String(room._id);
    const hoaDons = invoiceMap.get(key) || [];
    return {
      phongTroId: room._id,
      phong: room,
      tenDay: buildingMap.get(String(room.dayTroId)) || '',
      nguoiThue: tenantMap.get(key) || [],
      chiSoDienNuoc: readingMap.get(key) || null,
      soHoaDonConNo: hoaDons.length,
      tongCongNo: hoaDons.reduce((totalDue, invoice) => totalDue + invoice.conNo, 0),
      hoaDons,
    };
  });
  return guiThanhCong(res, {
    message: 'Đã tải bàn điều phối phòng.',
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

module.exports = { tongQuan, doanhThu, phongNoTien, layBanDieuPhoiPhong };
