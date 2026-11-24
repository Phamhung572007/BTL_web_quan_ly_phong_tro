const HoaDon = require('../models/hoa_don');
const { guiThanhCong, taoMetaPhanTrang } = require('../utils/phan_hoi_api');
const { layPhanTrang } = require('../utils/phan_trang');
const { doiObjectId, layPhong, layPhongMap } = require('../utils/du_lieu_phong');
const { layNguoiDungId, taoLoiHttp } = require('../middleware/yeu_cau_quyen_chu_tro');
const { laySo } = require('../utils/chuan_hoa_so');
const { taoDuLieuHoaDon } = require('../services/lap_hoa_don');
const { guiThongBao, layTaiKhoanNguoiThue } = require('../services/tao_thong_bao');

function layKy(duLieu) {
  return {
    thang: laySo(duLieu.thang, 'Tháng', { min: 1, max: 12 }),
    nam: laySo(duLieu.nam, 'Năm', { min: 2000, max: 2200 }),
  };
}

async function ganPhong(items) {
  const map = await layPhongMap(items.map((item) => item.phongTroId));
  return items.map((item) => ({ ...item, phong: map.get(String(item.phongTroId)) || null }));
}

async function layDanhSach(req, res) {
  const { page, limit, skip } = layPhanTrang(req.query);
  const filter = { chuTroId: layNguoiDungId(req) };
  for (const truong of ['phongTroId', 'dayTroId', 'trangThai']) {
    if (req.query[truong]) filter[truong] = req.query[truong];
  }
  if (req.query.thang) filter.thang = Number(req.query.thang);
  if (req.query.nam) filter.nam = Number(req.query.nam);
  const [items, total] = await Promise.all([
    HoaDon.find(filter).sort({ nam: -1, thang: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    HoaDon.countDocuments(filter),
  ]);
  return guiThanhCong(res, {
    message: 'Đã tải danh sách hóa đơn.',
    data: await ganPhong(items),
    meta: taoMetaPhanTrang({ page, limit, total }),
  });
}

async function layChiTiet(req, res) {
  const item = await HoaDon.findOne({ _id: req.params.maHoaDon, chuTroId: layNguoiDungId(req) }).lean();
  if (!item) throw taoLoiHttp(404, 'Không tìm thấy hóa đơn.');
  const [ketQua] = await ganPhong([item]);
  return guiThanhCong(res, { message: 'Đã tải hóa đơn.', data: ketQua });
}

async function layTheoPhong(req, res) {
  await layPhong(req.params.maPhong, layNguoiDungId(req));
  const { page, limit, skip } = layPhanTrang(req.query);
  const filter = { chuTroId: layNguoiDungId(req), phongTroId: req.params.maPhong };
  const [items, total] = await Promise.all([
    HoaDon.find(filter).sort({ nam: -1, thang: -1 }).skip(skip).limit(limit).lean(),
    HoaDon.countDocuments(filter),
  ]);
  return guiThanhCong(res, { message: 'Đã tải hóa đơn của phòng.', data: items, meta: taoMetaPhanTrang({ page, limit, total }) });
}

async function taoMotHoaDon({ phong, chuTroId, body }) {
  const { thang, nam } = layKy(body);
  const tonTai = await HoaDon.exists({ phongTroId: phong._id, thang, nam });
  if (tonTai) throw taoLoiHttp(409, `Phòng ${phong.soPhong || phong.tenPhong || ''} đã có hóa đơn trong kỳ này.`);
  const duLieu = await taoDuLieuHoaDon({
    phong, chuTroId, thang, nam, ghiChu: body.ghiChu || '', hanThanhToan: body.hanThanhToan,
  });
  const item = await HoaDon.create(duLieu);
  const nguoiNhanIds = await layTaiKhoanNguoiThue(item.nguoiThueIds);
  await guiThongBao({
    nguoiNhanIds,
    nguoiGuiId: chuTroId,
    loaiThongBao: 'HOA_DON_MOI',
    tieuDe: `Hóa đơn tháng ${thang}/${nam}`,
    noiDung: `Hóa đơn phòng ${phong.soPhong || phong.tenPhong || ''} có tổng tiền ${item.tongTien.toLocaleString('vi-VN')} ₫.`,
    duongDan: `/hoa-don/${item._id}`,
    doiTuongModel: 'HoaDon',
    doiTuongId: item._id,
  });
  return item;
}

async function taoMoi(req, res) {
  if (!req.body.phongTroId) throw taoLoiHttp(400, 'Cần chọn phòng để lập hóa đơn.');
  const phong = await layPhong(req.body.phongTroId, layNguoiDungId(req));
  const item = await taoMotHoaDon({ phong, chuTroId: layNguoiDungId(req), body: req.body });
  return guiThanhCong(res, { statusCode: 201, message: 'Đã tạo hóa đơn.', data: item });
}

async function taoTuDong(req, res) {
  const { thang, nam } = layKy(req.body);
  const chuTroId = doiObjectId(layNguoiDungId(req));
  const rooms = await require('mongoose').connection.collection('phongtros').find({
    chuTroId,
    tinhTrang: 'DANG_THUE',
    daXoaLuc: null,
  }).toArray();
  const results = [];
  for (const phong of rooms) {
    if (await HoaDon.exists({ phongTroId: phong._id, thang, nam })) {
      results.push({ phongTroId: phong._id, soPhong: phong.soPhong, trangThai: 'BO_QUA', lyDo: 'Đã có hóa đơn trong kỳ.' });
      continue;
    }
    try {
      const item = await taoMotHoaDon({ phong, chuTroId, body: { ...req.body, thang, nam } });
      results.push({ phongTroId: phong._id, soPhong: phong.soPhong, trangThai: 'DA_TAO', hoaDonId: item._id, tongTien: item.tongTien });
    } catch (error) {
      if (error.code === 11000) {
        results.push({ phongTroId: phong._id, soPhong: phong.soPhong, trangThai: 'BO_QUA', lyDo: 'Đã có hóa đơn trong kỳ.' });
      } else {
        results.push({ phongTroId: phong._id, soPhong: phong.soPhong, trangThai: 'LOI', lyDo: error.message });
      }
    }
  }
  const daTao = results.filter((item) => item.trangThai === 'DA_TAO').length;
  return guiThanhCong(res, {
    statusCode: 201,
    message: `Đã tạo ${daTao} hóa đơn; ${results.length - daTao} phòng được bỏ qua hoặc cần xử lý.`,
    data: results,
    meta: { created: daTao, skippedOrFailed: results.length - daTao, totalRooms: rooms.length },
  });
}

async function themThanhToan(req, res) {
  const item = await HoaDon.findOne({ _id: req.params.maHoaDon, chuTroId: layNguoiDungId(req) });
  if (!item) throw taoLoiHttp(404, 'Không tìm thấy hóa đơn.');
  if (item.trangThai === 'HUY') throw taoLoiHttp(409, 'Không thể xác nhận thanh toán cho hóa đơn đã hủy.');
  const conNo = Math.max(0, item.tongTien - item.daThanhToan);
  const soTien = req.body.soTien === undefined ? conNo : laySo(req.body.soTien, 'Số tiền', { min: 1 });
  if (soTien < 1 || soTien > conNo) throw taoLoiHttp(400, 'Số tiền thanh toán phải lớn hơn 0 và không vượt quá số còn nợ.');
  item.lichSuThanhToan.push({
    soTien,
    phuongThuc: req.body.phuongThuc || 'TIEN_MAT',
    maGiaoDich: req.body.maGiaoDich || '',
    ghiChu: req.body.ghiChu || '',
    nguoiNhanId: layNguoiDungId(req),
  });
  await item.save();
  await guiThongBao({
    nguoiNhanIds: await layTaiKhoanNguoiThue(item.nguoiThueIds),
    nguoiGuiId: layNguoiDungId(req),
    loaiThongBao: 'THANH_TOAN',
    tieuDe: 'Hóa đơn vừa được cập nhật thanh toán',
    noiDung: `Đã ghi nhận ${soTien.toLocaleString('vi-VN')} ₫ cho hóa đơn tháng ${item.thang}/${item.nam}.`,
    duongDan: `/hoa-don/${item._id}`,
    doiTuongModel: 'HoaDon',
    doiTuongId: item._id,
  });
  return guiThanhCong(res, { message: 'Đã ghi nhận thanh toán.', data: item });
}

module.exports = {
  layDanhSach,
  layChiTiet,
  layTheoPhong,
  taoMoi,
  taoTuDong,
  themThanhToan,
};
