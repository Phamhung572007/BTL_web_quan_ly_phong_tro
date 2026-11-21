const mongoose = require('mongoose');
const LichXem = require('../models/lich_xem');
const { guiThanhCong, taoMetaPhanTrang } = require('../utils/phan_hoi_api');
const { layPhanTrang } = require('../utils/phan_trang');
const { doiObjectId, layPhongMap } = require('../utils/du_lieu_phong');
const { layNguoiDung, layNguoiDungId, laChuTro, taoLoiHttp } = require('../middleware/yeu_cau_quyen_chu_tro');
const { guiThongBao } = require('../services/tao_thong_bao');

function laChuSoHuuLich(req, item) {
  return laChuTro(req) && String(item.chuTroId) === String(layNguoiDungId(req));
}

function laNguoiDatLich(req, item) {
  return String(item.nguoiDatId) === String(layNguoiDungId(req));
}

async function baoVeLich(req, item) {
  if (!item) throw taoLoiHttp(404, 'Không tìm thấy lịch xem phòng.');
  if (!laChuSoHuuLich(req, item) && !laNguoiDatLich(req, item)) {
    throw taoLoiHttp(403, 'Bạn không có quyền xem hoặc cập nhật lịch này.');
  }
}

async function ganPhong(items) {
  const phongMap = await layPhongMap(items.map((item) => item.phongTroId));
  return items.map((item) => ({ ...item, phong: phongMap.get(String(item.phongTroId)) || null }));
}

async function layDanhSach(req, res) {
  const { page, limit, skip } = layPhanTrang(req.query);
  const filter = laChuTro(req)
    ? { chuTroId: layNguoiDungId(req) }
    : { nguoiDatId: layNguoiDungId(req) };
  if (req.query.trangThai) filter.trangThai = req.query.trangThai;
  if (req.query.phongTroId) filter.phongTroId = req.query.phongTroId;
  const tuNgay = req.query['tu-ngay'];
  const denNgay = req.query['den-ngay'];
  if (tuNgay || denNgay) {
    filter.thoiGianMongMuon = {};
    if (tuNgay) filter.thoiGianMongMuon.$gte = new Date(tuNgay);
    if (denNgay) filter.thoiGianMongMuon.$lte = new Date(denNgay);
  }
  const [items, total] = await Promise.all([
    LichXem.find(filter).sort({ thoiGianMongMuon: 1 }).skip(skip).limit(limit).lean(),
    LichXem.countDocuments(filter),
  ]);
  return guiThanhCong(res, {
    message: 'Đã tải danh sách lịch xem phòng.',
    data: await ganPhong(items),
    meta: taoMetaPhanTrang({ page, limit, total }),
  });
}

async function layChiTiet(req, res) {
  const item = await LichXem.findById(req.params.maLichXem).lean();
  await baoVeLich(req, item);
  const [ketQua] = await ganPhong([item]);
  return guiThanhCong(res, { message: 'Đã tải lịch xem phòng.', data: ketQua });
}

async function taoMoi(req, res) {
  const phongTroId = doiObjectId(req.body.phongTroId);
  if (!phongTroId) throw taoLoiHttp(400, 'Mã phòng không hợp lệ.');
  const phong = await mongoose.connection.collection('phongtros').findOne({
    _id: phongTroId,
    tinhTrang: 'TRONG',
    daXoaLuc: null,
  });
  if (!phong) throw taoLoiHttp(404, 'Không tìm thấy phòng trống có thể đặt lịch xem.');
  if (req.body.tinDangId) {
    const tin = await mongoose.connection.collection('tindangphongs').findOne({
      _id: doiObjectId(req.body.tinDangId), phongTroId, trangThai: 'DA_DANG',
    });
    if (!tin) throw taoLoiHttp(400, 'Tin đăng không hợp lệ hoặc không còn được đăng.');
  }
  const thoiGianMongMuon = new Date(req.body.thoiGianMongMuon);
  if (Number.isNaN(thoiGianMongMuon.getTime()) || thoiGianMongMuon <= new Date()) {
    throw taoLoiHttp(400, 'Thời gian xem phòng phải ở tương lai.');
  }
  const nguoiDungId = layNguoiDungId(req);
  const item = await LichXem.create({
    tinDangId: req.body.tinDangId || null,
    phongTroId,
    dayTroId: phong.dayTroId,
    chuTroId: phong.chuTroId,
    nguoiDatId: nguoiDungId,
    nguoiThueId: req.body.nguoiThueId || null,
    thoiGianMongMuon,
    ghiChuNguoiDat: req.body.ghiChuNguoiDat || '',
  });
  await guiThongBao({
    nguoiNhanIds: [phong.chuTroId], nguoiGuiId: nguoiDungId, loaiThongBao: 'LICH_XEM',
    tieuDe: 'Có yêu cầu xem phòng mới',
    noiDung: `Khách đã gửi yêu cầu xem phòng ${phong.soPhong || phong.tenPhong || ''}.`,
    duongDan: '/lich-xem', doiTuongModel: 'LichXem', doiTuongId: item._id,
  });
  return guiThanhCong(res, { statusCode: 201, message: 'Đã gửi yêu cầu xem phòng.', data: item });
}

async function duyet(req, res) {
  const item = await LichXem.findById(req.params.maLichXem);
  await baoVeLich(req, item);
  if (!laChuSoHuuLich(req, item)) throw taoLoiHttp(403, 'Chỉ chủ trọ mới được duyệt lịch xem.');
  if (!['CHO_XAC_NHAN', 'DE_XUAT_DOI_LICH'].includes(item.trangThai)) {
    throw taoLoiHttp(409, 'Lịch này không còn ở trạng thái chờ duyệt.');
  }
  if (req.body.thoiGianDaDuyet) {
    const time = new Date(req.body.thoiGianDaDuyet);
    if (Number.isNaN(time.getTime()) || time <= new Date()) throw taoLoiHttp(400, 'Thời gian duyệt phải ở tương lai.');
    item.thoiGianDaDuyet = time;
  } else {
    item.thoiGianDaDuyet = item.thoiGianMongMuon;
  }
  item.trangThai = 'DA_DUYET';
  item.ghiChuChuTro = req.body.ghiChuChuTro || item.ghiChuChuTro;
  await item.save();
  await guiThongBao({
    nguoiNhanIds: [item.nguoiDatId], nguoiGuiId: layNguoiDungId(req), loaiThongBao: 'LICH_XEM',
    tieuDe: 'Lịch xem phòng đã được duyệt',
    noiDung: `Lịch xem phòng đã được duyệt vào ${item.thoiGianDaDuyet.toLocaleString('vi-VN')}.`,
    duongDan: '/lich-xem', doiTuongModel: 'LichXem', doiTuongId: item._id,
  });
  return guiThanhCong(res, { message: 'Đã duyệt lịch xem phòng.', data: item });
}

async function doiLich(req, res) {
  const item = await LichXem.findById(req.params.maLichXem);
  await baoVeLich(req, item);
  if (!laChuSoHuuLich(req, item) && req.body.xacNhan === true) {
    if (item.trangThai !== 'DE_XUAT_DOI_LICH' || !item.thoiGianDaDuyet) {
      throw taoLoiHttp(409, 'Không có lịch mới đang chờ bạn xác nhận.');
    }
    item.thoiGianMongMuon = item.thoiGianDaDuyet;
    item.trangThai = 'DA_XAC_NHAN';
    await item.save();
    await guiThongBao({
      nguoiNhanIds: [item.chuTroId], nguoiGuiId: layNguoiDungId(req), loaiThongBao: 'LICH_XEM',
      tieuDe: 'Khách đã xác nhận lịch mới', noiDung: 'Khách đã xác nhận thời gian xem phòng được đề xuất.',
      duongDan: '/lich-xem', doiTuongModel: 'LichXem', doiTuongId: item._id,
    });
    return guiThanhCong(res, { message: 'Đã xác nhận lịch xem mới.', data: item });
  }
  const thoiGian = new Date(req.body.thoiGianDeXuat || req.body.thoiGianMongMuon);
  if (Number.isNaN(thoiGian.getTime()) || thoiGian <= new Date()) throw taoLoiHttp(400, 'Thời gian mới phải ở tương lai.');
  const laChuTroQuanLy = laChuSoHuuLich(req, item);
  if (laChuTroQuanLy) {
    item.lichSuDoiLich.push({ nguoiThucHienId: layNguoiDungId(req), thoiGianDeXuat: thoiGian, ghiChu: req.body.ghiChu || '' });
    item.thoiGianDaDuyet = thoiGian;
    item.trangThai = 'DE_XUAT_DOI_LICH';
    item.ghiChuChuTro = req.body.ghiChu || item.ghiChuChuTro;
  } else {
    if (!['CHO_XAC_NHAN', 'DA_DUYET', 'DE_XUAT_DOI_LICH'].includes(item.trangThai)) {
      throw taoLoiHttp(409, 'Lịch này không thể đổi ở trạng thái hiện tại.');
    }
    item.lichSuDoiLich.push({ nguoiThucHienId: layNguoiDungId(req), thoiGianDeXuat: thoiGian, ghiChu: req.body.ghiChu || '' });
    item.thoiGianMongMuon = thoiGian;
    item.thoiGianDaDuyet = null;
    item.trangThai = 'CHO_XAC_NHAN';
    item.ghiChuNguoiDat = req.body.ghiChu || item.ghiChuNguoiDat;
  }
  await item.save();
  await guiThongBao({
    nguoiNhanIds: laChuTroQuanLy ? [item.nguoiDatId] : [item.chuTroId],
    nguoiGuiId: layNguoiDungId(req), loaiThongBao: 'LICH_XEM',
    tieuDe: laChuTroQuanLy ? 'Có đề xuất đổi lịch xem phòng' : 'Khách đề nghị đổi lịch xem phòng',
    noiDung: `Thời gian được đề xuất: ${thoiGian.toLocaleString('vi-VN')}.`,
    duongDan: '/lich-xem', doiTuongModel: 'LichXem', doiTuongId: item._id,
  });
  return guiThanhCong(res, { message: laChuTroQuanLy ? 'Đã đề xuất đổi lịch.' : 'Đã gửi yêu cầu đổi lịch.', data: item });
}

async function huy(req, res) {
  const item = await LichXem.findById(req.params.maLichXem);
  await baoVeLich(req, item);
  if (['DA_HOAN_TAT', 'DA_HUY', 'TU_CHOI'].includes(item.trangThai)) {
    throw taoLoiHttp(409, 'Lịch này đã kết thúc hoặc đã bị hủy.');
  }
  item.trangThai = 'DA_HUY';
  item.lyDoHuy = req.body.lyDoHuy || '';
  await item.save();
  await guiThongBao({
    nguoiNhanIds: [laChuSoHuuLich(req, item) ? item.nguoiDatId : item.chuTroId],
    nguoiGuiId: layNguoiDungId(req), loaiThongBao: 'LICH_XEM',
    tieuDe: 'Lịch xem phòng đã bị hủy', noiDung: item.lyDoHuy || 'Lịch xem phòng đã được hủy.',
    duongDan: '/lich-xem', doiTuongModel: 'LichXem', doiTuongId: item._id,
  });
  return guiThanhCong(res, { message: 'Đã hủy lịch xem phòng.', data: item });
}

module.exports = { layDanhSach, layChiTiet, taoMoi, duyet, doiLich, huy };
