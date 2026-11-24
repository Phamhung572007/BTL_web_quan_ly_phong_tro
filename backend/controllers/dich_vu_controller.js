const mongoose = require('mongoose');
const DichVu = require('../models/dich_vu');
const HoaDon = require('../models/hoa_don');
const { guiThanhCong } = require('../utils/phan_hoi_api');
const { layPhanTrang } = require('../utils/phan_trang');
const { layNguoiDungId, taoLoiHttp } = require('../middleware/yeu_cau_quyen_chu_tro');
const { doiObjectId } = require('../utils/du_lieu_phong');
const { tinhTienBacThang } = require('../services/tinh_tien_bac_thang');

function dieuKienMa(maDichVu, chuTroId) {
  return mongoose.Types.ObjectId.isValid(maDichVu)
    ? { _id: maDichVu, chuTroId }
    : { maDichVu: String(maDichVu).trim().toUpperCase(), chuTroId };
}

function locDuLieuDuocPhep(duLieu) {
  const cacTruong = [
    'dayTroId', 'maDichVu', 'tenDichVu', 'loaiDichVu', 'donViTinh', 'donGia', 'bacGia',
    'donViDinhMuc', 'ngayHieuLucGia', 'nguonGia', 'giaChuaThue', 'cachTinh', 'cachApGia', 'batBuoc',
    'dangApDung', 'moTa',
  ];
  return Object.fromEntries(cacTruong.filter((truong) => duLieu[truong] !== undefined)
    .map((truong) => [truong, duLieu[truong]]));
}

async function kiemTraCauHinhDichVu(duLieu, chuTroId) {
  if (duLieu.dayTroId) {
    const dayTro = await require('mongoose').connection.collection('daytros').findOne({
      _id: doiObjectId(duLieu.dayTroId), chuTroId: doiObjectId(chuTroId), daXoaLuc: null,
    });
    if (!dayTro) throw taoLoiHttp(404, 'Không tìm thấy dãy trọ thuộc quyền quản lý của bạn.');
  }
  if (['DIEN', 'NUOC'].includes(duLieu.loaiDichVu) && duLieu.cachApGia === 'DON_GIA_BAC_2'
    && !duLieu.bacGia?.some((bac) => Number(bac.bac) === 2)) {
    throw taoLoiHttp(400, 'Áp dụng đơn giá bậc 2 cần có cấu hình bậc giá số 2.');
  }
  if (['DIEN', 'NUOC'].includes(duLieu.loaiDichVu) && duLieu.bacGia?.length) {
    try {
      tinhTienBacThang(0, duLieu.bacGia, 1, duLieu.cachApGia || 'BAC_THANG');
    } catch (error) {
      throw taoLoiHttp(400, error.message);
    }
  }
}

async function layDanhSach(req, res) {
  const { page, limit, skip } = layPhanTrang(req.query);
  const filter = { chuTroId: layNguoiDungId(req) };
  if (req.query.dayTroId) filter.dayTroId = req.query.dayTroId;
  if (req.query.loaiDichVu) filter.loaiDichVu = req.query.loaiDichVu;
  if (req.query.dangApDung !== undefined) filter.dangApDung = req.query.dangApDung !== 'false';
  const [items, total] = await Promise.all([
    DichVu.find(filter).sort({ loaiDichVu: 1, tenDichVu: 1 }).skip(skip).limit(limit).lean(),
    DichVu.countDocuments(filter),
  ]);
  return guiThanhCong(res, {
    message: 'Đã tải danh sách dịch vụ.', data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

async function layChiTiet(req, res) {
  const dichVu = await DichVu.findOne(dieuKienMa(req.params.maDichVu, layNguoiDungId(req))).lean();
  if (!dichVu) throw taoLoiHttp(404, 'Không tìm thấy dịch vụ.');
  return guiThanhCong(res, { message: 'Đã tải dịch vụ.', data: dichVu });
}

async function taoMoi(req, res) {
  const duLieu = locDuLieuDuocPhep(req.body);
  await kiemTraCauHinhDichVu(duLieu, layNguoiDungId(req));
  const dichVu = await DichVu.create({ ...duLieu, chuTroId: layNguoiDungId(req) });
  return guiThanhCong(res, { statusCode: 201, message: 'Đã tạo dịch vụ.', data: dichVu });
}

async function capNhat(req, res) {
  const dichVu = await DichVu.findOne(dieuKienMa(req.params.maDichVu, layNguoiDungId(req)));
  if (!dichVu) throw taoLoiHttp(404, 'Không tìm thấy dịch vụ.');
  const duLieu = locDuLieuDuocPhep(req.body);
  await kiemTraCauHinhDichVu({ ...dichVu.toObject(), ...duLieu }, layNguoiDungId(req));
  Object.assign(dichVu, duLieu);
  await dichVu.save();
  return guiThanhCong(res, { message: 'Đã cập nhật dịch vụ.', data: dichVu });
}

async function xoa(req, res) {
  const dichVu = await DichVu.findOne(dieuKienMa(req.params.maDichVu, layNguoiDungId(req)));
  if (!dichVu) throw taoLoiHttp(404, 'Không tìm thấy dịch vụ.');
  const daDung = await HoaDon.exists({ 'cacKhoanThu.dichVuId': dichVu._id });
  if (daDung) {
    dichVu.dangApDung = false;
    await dichVu.save();
    return guiThanhCong(res, { message: 'Dịch vụ đã được dùng trong hóa đơn nên đã ngừng áp dụng.', data: dichVu });
  }
  await dichVu.deleteOne();
  return guiThanhCong(res, { message: 'Đã xóa dịch vụ.', data: { _id: dichVu._id } });
}

module.exports = { layDanhSach, layChiTiet, taoMoi, capNhat, xoa };
