const mongoose = require('mongoose');
const BaiViet = require('../models/bai_viet');
const { guiThanhCong, taoMetaPhanTrang } = require('../utils/phan_hoi_api');
const { layPhanTrang } = require('../utils/phan_trang');
const { layNguoiDungId, laChuTro, taoLoiHttp } = require('../middleware/yeu_cau_quyen_chu_tro');

const TRUONG_DUOC_SUA = [
  'loaiBaiViet', 'tieuDe', 'slug', 'tomTat', 'noiDung', 'anhDaiDien', 'hinhAnh', 'tags',
  'trangThai', 'ghimLenDau', 'ngayBatDauSuKien', 'ngayKetThucSuKien', 'lyDoTuChoi',
];

function laQuanTri(req) {
  return String(req.user?.vaiTro || req.user?.role || '').toUpperCase() === 'QUAN_TRI';
}

async function layCuaToi(req, res) {
  const { page, limit, skip } = layPhanTrang(req.query);
  const filter = { tacGiaId: layNguoiDungId(req) };
  if (req.query.trangThai) filter.trangThai = req.query.trangThai;
  const [items, total] = await Promise.all([
    BaiViet.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    BaiViet.countDocuments(filter),
  ]);
  return guiThanhCong(res, { message: 'Đã tải bài viết của bạn.', data: items, meta: taoMetaPhanTrang({ page, limit, total }) });
}

async function layDanhSach(req, res) {
  const { page, limit, skip } = layPhanTrang(req.query);
  const filter = { trangThai: 'DA_DANG' };
  if (req.query.loaiBaiViet) filter.loaiBaiViet = req.query.loaiBaiViet;
  if (req.query.tuKhoa || req.query['tu-khoa']) {
    const keyword = String(req.query.tuKhoa || req.query['tu-khoa']).trim();
    filter.$text = { $search: keyword };
  }
  const [items, total] = await Promise.all([
    BaiViet.find(filter).sort({ ghimLenDau: -1, ngayDang: -1 }).skip(skip).limit(limit).lean(),
    BaiViet.countDocuments(filter),
  ]);
  return guiThanhCong(res, { message: 'Đã tải bảng tin.', data: items, meta: taoMetaPhanTrang({ page, limit, total }) });
}

async function layChiTiet(req, res) {
  const filter = mongoose.Types.ObjectId.isValid(req.params.maBaiViet)
    ? { _id: req.params.maBaiViet }
    : { slug: req.params.maBaiViet };
  const item = await BaiViet.findOne(filter).lean();
  if (!item) throw taoLoiHttp(404, 'Không tìm thấy bài viết.');
  const duocXemBanThao = req.user
    && (laQuanTri(req) || String(item.tacGiaId) === String(layNguoiDungId(req)));
  if (item.trangThai !== 'DA_DANG' && !duocXemBanThao) throw taoLoiHttp(404, 'Không tìm thấy bài viết.');
  if (item.trangThai === 'DA_DANG') {
    await BaiViet.updateOne({ _id: item._id }, { $inc: { luotXem: 1 } });
    item.luotXem += 1;
  }
  return guiThanhCong(res, { message: 'Đã tải bài viết.', data: item });
}

async function taoMoi(req, res) {
  const duLieu = Object.fromEntries(TRUONG_DUOC_SUA
    .filter((key) => req.body[key] !== undefined)
    .map((key) => [key, req.body[key]]));
  if (duLieu.trangThai === 'DA_DANG') duLieu.ngayDang = new Date();
  const item = await BaiViet.create({ ...duLieu, tacGiaId: layNguoiDungId(req) });
  return guiThanhCong(res, { statusCode: 201, message: 'Đã tạo bài viết.', data: item });
}

async function capNhat(req, res) {
  const item = await BaiViet.findById(req.params.maBaiViet);
  if (!item) throw taoLoiHttp(404, 'Không tìm thấy bài viết.');
  if (!laQuanTri(req) && String(item.tacGiaId) !== String(layNguoiDungId(req))) {
    throw taoLoiHttp(403, 'Bạn chỉ có thể sửa bài viết của mình.');
  }
  for (const key of TRUONG_DUOC_SUA) if (req.body[key] !== undefined) item[key] = req.body[key];
  if (item.trangThai === 'DA_DANG' && !item.ngayDang) item.ngayDang = new Date();
  await item.save();
  return guiThanhCong(res, { message: 'Đã cập nhật bài viết.', data: item });
}

async function xoa(req, res) {
  const item = await BaiViet.findById(req.params.maBaiViet);
  if (!item) throw taoLoiHttp(404, 'Không tìm thấy bài viết.');
  if (!laQuanTri(req) && String(item.tacGiaId) !== String(layNguoiDungId(req))) {
    throw taoLoiHttp(403, 'Bạn không có quyền xóa bài viết này.');
  }
  await item.deleteOne();
  return guiThanhCong(res, { message: 'Đã xóa bài viết.', data: { _id: item._id } });
}

module.exports = { layCuaToi, layDanhSach, layChiTiet, taoMoi, capNhat, xoa };
