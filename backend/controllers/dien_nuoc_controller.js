const mongoose = require('mongoose');
const ChiSoDienNuoc = require('../models/chi_so_dien_nuoc');
const { guiThanhCong, taoMetaPhanTrang } = require('../utils/phan_hoi_api');
const { layPhanTrang } = require('../utils/phan_trang');
const { layNguoiDungId, taoLoiHttp } = require('../middleware/yeu_cau_quyen_chu_tro');
const { layPhong } = require('../utils/du_lieu_phong');
const { taoDongHo } = require('../services/tinh_gia_chi_so');
const { laySo } = require('../utils/chuan_hoa_so');

function layKy(req) {
  const thang = laySo(req.body.thang ?? req.query.thang, 'Tháng', { min: 1, max: 12 });
  const nam = laySo(req.body.nam ?? req.query.nam, 'Năm', { min: 2000, max: 2200 });
  return { thang, nam };
}

function layDuLieuDongHo(duLieu, ten) {
  if (!duLieu || duLieu.chiSoCu === undefined || duLieu.chiSoMoi === undefined) {
    throw taoLoiHttp(400, `Cần nhập chỉ số cũ và chỉ số mới cho ${ten}.`);
  }
  const chiSoCu = laySo(duLieu.chiSoCu, `Chỉ số cũ ${ten}`);
  const chiSoMoi = laySo(duLieu.chiSoMoi, `Chỉ số mới ${ten}`);
  if (chiSoMoi < chiSoCu) throw taoLoiHttp(400, `Chỉ số mới ${ten} không được nhỏ hơn chỉ số cũ.`);
  return { chiSoCu, chiSoMoi, cachApGia: duLieu.cachApGia };
}

async function taoBanGhi({ req, duLieu, choPhepDaTonTai = false }) {
  const chuTroId = layNguoiDungId(req);
  const phongTroId = duLieu.phongTroId;
  const phong = await layPhong(phongTroId, chuTroId);
  const { thang, nam } = layKy({ body: duLieu, query: {} });
  if (!choPhepDaTonTai && await ChiSoDienNuoc.exists({ phongTroId, thang, nam })) {
    throw taoLoiHttp(409, `Phòng ${phong.soPhong || phong.tenPhong || ''} đã có chỉ số trong kỳ này.`);
  }
  const [dien, nuoc] = await Promise.all([
    taoDongHo({ chuTroId, phongTroId, dayTroId: phong.dayTroId, loaiDichVu: 'DIEN', duLieu: layDuLieuDongHo(duLieu.dien, 'điện') }),
    taoDongHo({ chuTroId, phongTroId, dayTroId: phong.dayTroId, loaiDichVu: 'NUOC', duLieu: layDuLieuDongHo(duLieu.nuoc, 'nước') }),
  ]);
  return new ChiSoDienNuoc({
    chuTroId, dayTroId: phong.dayTroId, phongTroId, thang, nam, dien, nuoc,
    nguoiGhiId: chuTroId, ghiChu: duLieu.ghiChu || '',
    ngayGhi: duLieu.ngayGhi || new Date(),
  });
}

async function layDanhSach(req, res) {
  const { page, limit, skip } = layPhanTrang(req.query);
  const filter = { chuTroId: layNguoiDungId(req) };
  if (req.query.phongTroId) filter.phongTroId = req.query.phongTroId;
  if (req.query.dayTroId) filter.dayTroId = req.query.dayTroId;
  if (req.query.thang) filter.thang = Number(req.query.thang);
  if (req.query.nam) filter.nam = Number(req.query.nam);
  const [items, total] = await Promise.all([
    ChiSoDienNuoc.find(filter).sort({ nam: -1, thang: -1, ngayGhi: -1 }).skip(skip).limit(limit).lean(),
    ChiSoDienNuoc.countDocuments(filter),
  ]);
  return guiThanhCong(res, { message: 'Đã tải chỉ số điện nước.', data: items, meta: taoMetaPhanTrang({ page, limit, total }) });
}

async function layChiTiet(req, res) {
  const item = await ChiSoDienNuoc.findOne({ _id: req.params.maChiSo, chuTroId: layNguoiDungId(req) }).lean();
  if (!item) throw taoLoiHttp(404, 'Không tìm thấy bản ghi chỉ số.');
  return guiThanhCong(res, { message: 'Đã tải bản ghi chỉ số.', data: item });
}

async function layLichSuPhong(req, res) {
  const phongTroId = req.params.maPhong;
  await layPhong(phongTroId, layNguoiDungId(req));
  const { page, limit, skip } = layPhanTrang(req.query);
  const filter = { phongTroId, chuTroId: layNguoiDungId(req) };
  const [items, total] = await Promise.all([
    ChiSoDienNuoc.find(filter).sort({ nam: -1, thang: -1 }).skip(skip).limit(limit).lean(),
    ChiSoDienNuoc.countDocuments(filter),
  ]);
  return guiThanhCong(res, { message: 'Đã tải lịch sử điện nước của phòng.', data: items, meta: taoMetaPhanTrang({ page, limit, total }) });
}

async function taoMoi(req, res) {
  const item = await taoBanGhi({ req, duLieu: req.body });
  await item.save();
  return guiThanhCong(res, { statusCode: 201, message: 'Đã ghi chỉ số điện nước.', data: item });
}

async function nhapHangLoat(req, res) {
  const items = req.body.items;
  if (!Array.isArray(items) || items.length < 1 || items.length > 100) {
    throw taoLoiHttp(400, 'Danh sách nhập hàng loạt phải có từ 1 đến 100 phòng.');
  }
  const { thang, nam } = layKy({ body: req.body, query: {} });
  const phongIds = items.map((item) => item.phongTroId);
  if (new Set(phongIds.map(String)).size !== phongIds.length) {
    throw taoLoiHttp(400, 'Danh sách không được có phòng trùng lặp.');
  }
  const daCo = await ChiSoDienNuoc.find({ chuTroId: layNguoiDungId(req), phongTroId: { $in: phongIds }, thang, nam }).select('phongTroId').lean();
  if (daCo.length) throw taoLoiHttp(409, 'Một hoặc nhiều phòng đã được ghi chỉ số trong kỳ này.');
  const records = await Promise.all(items.map((duLieu) => taoBanGhi({
    req, duLieu: { ...duLieu, thang, nam },
  })));
  for (const record of records) await record.save();
  return guiThanhCong(res, {
    statusCode: 201,
    message: `Đã ghi chỉ số cho ${records.length} phòng.`,
    data: records,
  });
}

async function capNhat(req, res) {
  const item = await ChiSoDienNuoc.findOne({ _id: req.params.maChiSo, chuTroId: layNguoiDungId(req) });
  if (!item) throw taoLoiHttp(404, 'Không tìm thấy bản ghi chỉ số.');
  const duLieu = req.body;
  if (duLieu.thang !== undefined) item.thang = laySo(duLieu.thang, 'Tháng', { min: 1, max: 12 });
  if (duLieu.nam !== undefined) item.nam = laySo(duLieu.nam, 'Năm', { min: 2000, max: 2200 });
  for (const ten of ['dien', 'nuoc']) {
    if (duLieu[ten]) Object.assign(item[ten], layDuLieuDongHo(duLieu[ten], ten));
  }
  if (duLieu.ghiChu !== undefined) item.ghiChu = duLieu.ghiChu;
  if (duLieu.ngayGhi !== undefined) item.ngayGhi = duLieu.ngayGhi;
  const banGhiTrung = await ChiSoDienNuoc.exists({
    _id: { $ne: item._id }, phongTroId: item.phongTroId, thang: item.thang, nam: item.nam,
  });
  if (banGhiTrung) throw taoLoiHttp(409, 'Phòng đã có bản ghi chỉ số trong kỳ này.');
  await item.save();
  return guiThanhCong(res, { message: 'Đã cập nhật chỉ số điện nước.', data: item });
}

module.exports = { layDanhSach, layChiTiet, layLichSuPhong, taoMoi, nhapHangLoat, capNhat };
