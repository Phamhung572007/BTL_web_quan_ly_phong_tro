const mongoose = require('mongoose');
const DanhGiaPhong = require('../models/danh_gia_phong');
const { guiThanhCong, taoMetaPhanTrang } = require('../utils/phan_hoi_api');
const { layPhanTrang } = require('../utils/phan_trang');
const { doiObjectId, layPhongMap } = require('../utils/du_lieu_phong');
const { layNguoiDungId, taoLoiHttp } = require('../middleware/yeu_cau_quyen_chu_tro');
const { guiThongBao } = require('../services/tao_thong_bao');

function laQuanTri(req) {
  return String(req.user?.vaiTro || req.user?.role || '').toUpperCase() === 'QUAN_TRI';
}

async function layPhongCua(req, phongTroId) {
  const phong = await mongoose.connection.collection('phongtros').findOne({ _id: doiObjectId(phongTroId) });
  return phong && String(phong.chuTroId) === String(layNguoiDungId(req)) ? phong : null;
}

async function layDanhSachCuaToi(req, res) {
  const { page, limit, skip } = layPhanTrang(req.query);
  const phongIds = await mongoose.connection.collection('phongtros')
    .find({ chuTroId: doiObjectId(layNguoiDungId(req)) }, { projection: { _id: 1 } }).toArray();
  const ids = phongIds.map((phong) => phong._id);
  const filter = { phongTroId: { $in: ids } };
  if (req.query.trangThai) filter.trangThai = req.query.trangThai;
  const [items, total] = await Promise.all([
    DanhGiaPhong.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    DanhGiaPhong.countDocuments(filter),
  ]);
  const phongMap = await layPhongMap(items.map((item) => item.phongTroId));
  return guiThanhCong(res, { message: 'Đã tải đánh giá cho phòng của bạn.', data: items.map((item) => ({ ...item, phong: phongMap.get(String(item.phongTroId)) || null })), meta: taoMetaPhanTrang({ page, limit, total }) });
}

async function layDanhSach(req, res) {
  const { page, limit, skip } = layPhanTrang(req.query);
  const filter = { trangThai: 'DA_DUYET' };
  const maPhong = req.query.maPhong || req.query['ma-phong'];
  if (maPhong) filter.phongTroId = maPhong;
  const [items, total] = await Promise.all([
    DanhGiaPhong.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    DanhGiaPhong.countDocuments(filter),
  ]);
  return guiThanhCong(res, { message: 'Đã tải đánh giá phòng.', data: items, meta: taoMetaPhanTrang({ page, limit, total }) });
}

async function layChiTiet(req, res) {
  const item = await DanhGiaPhong.findById(req.params.maDanhGia).lean();
  if (!item) throw taoLoiHttp(404, 'Không tìm thấy đánh giá.');
  const laTacGia = String(item.nguoiDanhGiaId) === String(layNguoiDungId(req));
  const phongCuaChuTro = await layPhongCua(req, item.phongTroId);
  if (item.trangThai !== 'DA_DUYET' && !laTacGia && !phongCuaChuTro && !laQuanTri(req)) {
    throw taoLoiHttp(404, 'Không tìm thấy đánh giá.');
  }
  return guiThanhCong(res, { message: 'Đã tải đánh giá.', data: item });
}

async function taoMoi(req, res) {
  const phongTroId = doiObjectId(req.body.phongTroId || req.body.maPhong);
  if (!phongTroId) throw taoLoiHttp(400, 'Mã phòng không hợp lệ.');
  const nguoiDungId = doiObjectId(layNguoiDungId(req));
  const phong = await mongoose.connection.collection('phongtros').findOne({ _id: phongTroId });
  if (!phong) throw taoLoiHttp(404, 'Không tìm thấy phòng.');
  const nguoiThue = await mongoose.connection.collection('nguoithues').findOne({
    chuTroId: phong.chuTroId,
    phongTroId,
    taiKhoanId: nguoiDungId,
    trangThai: { $in: ['DANG_O', 'DA_ROI_DI'] },
  });
  if (!nguoiThue) throw taoLoiHttp(403, 'Chỉ người thuê hiện tại hoặc đã từng thuê phòng này mới được đánh giá.');
  const hopDong = await mongoose.connection.collection('hopdongs').findOne({
    phongTroId,
    nguoiThueIds: nguoiThue._id,
    trangThai: { $in: ['DANG_HIEU_LUC', 'DA_THANH_LY'] },
  });
  if (hopDong && await DanhGiaPhong.exists({ hopDongId: hopDong._id })) {
    throw taoLoiHttp(409, 'Hợp đồng này đã có đánh giá.');
  }
  const item = await DanhGiaPhong.create({
    phongTroId,
    tinDangId: req.body.tinDangId || null,
    hopDongId: hopDong?._id || null,
    nguoiDanhGiaId: nguoiDungId,
    nguoiThueId: nguoiThue._id,
    diem: req.body.diem,
    tieuDe: req.body.tieuDe || '',
    noiDung: req.body.noiDung,
    hinhAnh: req.body.hinhAnh || [],
    trangThai: 'CHO_DUYET',
  });
  await guiThongBao({
    nguoiNhanIds: [phong.chuTroId], nguoiGuiId: nguoiDungId, loaiThongBao: 'DANH_GIA',
    tieuDe: 'Có đánh giá phòng mới', noiDung: 'Người thuê vừa gửi đánh giá và đang chờ duyệt.',
    duongDan: '/danh-gia-phong', doiTuongModel: 'DanhGiaPhong', doiTuongId: item._id,
  });
  return guiThanhCong(res, { statusCode: 201, message: 'Đã gửi đánh giá để chủ trọ duyệt.', data: item });
}

async function capNhat(req, res) {
  const item = await DanhGiaPhong.findById(req.params.maDanhGia);
  if (!item) throw taoLoiHttp(404, 'Không tìm thấy đánh giá.');
  const laTacGia = String(item.nguoiDanhGiaId) === String(layNguoiDungId(req));
  const phongCuaChuTro = await layPhongCua(req, item.phongTroId);
  if (laTacGia) {
    for (const key of ['diem', 'tieuDe', 'noiDung', 'hinhAnh']) {
      if (req.body[key] !== undefined) item[key] = req.body[key];
    }
  } else if (phongCuaChuTro || laQuanTri(req)) {
    if (req.body.phanHoiChuTro) {
      item.phanHoiChuTro = {
        noiDung: req.body.phanHoiChuTro.noiDung,
        nguoiPhanHoiId: layNguoiDungId(req),
        phanHoiLuc: new Date(),
      };
    }
    if (req.body.trangThai && ['DA_DUYET', 'DA_AN', 'TU_CHOI'].includes(req.body.trangThai)) {
      item.trangThai = req.body.trangThai;
    }
    if (req.body.lyDoAn !== undefined) item.lyDoAn = req.body.lyDoAn;
  } else {
    throw taoLoiHttp(403, 'Bạn không có quyền cập nhật đánh giá này.');
  }
  await item.save();
  if (!laTacGia && item.phanHoiChuTro?.noiDung) {
    await guiThongBao({
      nguoiNhanIds: [item.nguoiDanhGiaId], nguoiGuiId: layNguoiDungId(req), loaiThongBao: 'DANH_GIA',
      tieuDe: 'Chủ trọ đã phản hồi đánh giá', noiDung: item.phanHoiChuTro.noiDung,
      duongDan: '/danh-gia-phong', doiTuongModel: 'DanhGiaPhong', doiTuongId: item._id,
    });
  }
  return guiThanhCong(res, { message: 'Đã cập nhật đánh giá.', data: item });
}

async function xoa(req, res) {
  const item = await DanhGiaPhong.findById(req.params.maDanhGia);
  if (!item) throw taoLoiHttp(404, 'Không tìm thấy đánh giá.');
  const laTacGia = String(item.nguoiDanhGiaId) === String(layNguoiDungId(req));
  const phongCuaChuTro = await layPhongCua(req, item.phongTroId);
  if (!laTacGia && !phongCuaChuTro && !laQuanTri(req)) throw taoLoiHttp(403, 'Bạn không có quyền xóa đánh giá này.');
  await item.deleteOne();
  return guiThanhCong(res, { message: 'Đã xóa đánh giá.', data: { _id: item._id } });
}

module.exports = { layDanhSachCuaToi, layDanhSach, layChiTiet, taoMoi, capNhat, xoa };
