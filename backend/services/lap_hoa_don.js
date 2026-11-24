const mongoose = require('mongoose');
const DichVu = require('../models/dich_vu');
const ChiSoDienNuoc = require('../models/chi_so_dien_nuoc');
const { taoLoiHttp } = require('../middleware/yeu_cau_quyen_chu_tro');

function snapshotDongHo(dongHo = {}) {
  return {
    chiSoCu: dongHo.chiSoCu || 0,
    chiSoMoi: dongHo.chiSoMoi || 0,
    tieuThu: dongHo.tieuThu || 0,
    donGia: dongHo.donGia || 0,
    soNguoiSuDung: dongHo.soNguoiSuDung || 0,
    soNguoiDinhMuc: dongHo.soNguoiDinhMuc || 1,
    heSoDinhMuc: dongHo.heSoDinhMuc || 1,
    cachApGia: dongHo.cachApGia || 'BAC_THANG',
    chiTietBac: (dongHo.chiTietBac || []).map((bac) => ({ ...bac.toObject?.() || bac })),
    ngayHieuLucGia: dongHo.ngayHieuLucGia || null,
    nguonGia: dongHo.nguonGia || '',
    giaChuaThue: dongHo.giaChuaThue !== false,
  };
}

async function layNguoiO({ phongTroId, chuTroId, hopDong }) {
  if (Array.isArray(hopDong?.nguoiThueIds) && hopDong.nguoiThueIds.length) return hopDong.nguoiThueIds;
  const docs = await mongoose.connection.collection('nguoithues').find({
    chuTroId, phongTroId, trangThai: 'DANG_O',
  }, { projection: { _id: 1 } }).toArray();
  return docs.map((doc) => doc._id);
}

async function taoDuLieuHoaDon({ phong, chuTroId, thang, nam, ghiChu = '', hanThanhToan }) {
  const [hopDong, chiSo] = await Promise.all([
    mongoose.connection.collection('hopdongs').findOne({
      chuTroId, phongTroId: phong._id, trangThai: 'DANG_HIEU_LUC',
    }),
    ChiSoDienNuoc.findOne({ chuTroId, phongTroId: phong._id, thang, nam }).lean(),
  ]);
  if (!chiSo) throw taoLoiHttp(422, `Chưa có chỉ số điện nước của phòng ${phong.soPhong || phong.tenPhong || ''} trong kỳ này.`);

  const soNguoiSuDung = Math.max(1, Number(chiSo.dien?.soNguoiSuDung || chiSo.nuoc?.soNguoiSuDung || 1));
  const dichVus = await DichVu.find({
    chuTroId,
    dangApDung: true,
    $or: [{ dayTroId: phong.dayTroId }, { dayTroId: null }],
  }).sort({ dayTroId: -1 }).lean();
  const daChon = new Map();
  for (const dichVu of dichVus) {
    const khoa = dichVu.maDichVu || String(dichVu._id);
    if (!daChon.has(khoa) || String(dichVu.dayTroId || '') === String(phong.dayTroId)) {
      daChon.set(khoa, dichVu);
    }
  }

  const cacKhoanThu = [...daChon.values()]
    .filter((dichVu) => !['DIEN', 'NUOC'].includes(dichVu.loaiDichVu))
    .map((dichVu) => {
      const cachTinh = dichVu.cachTinh || 'THEO_PHONG';
      const soLuong = cachTinh === 'THEO_NGUOI' ? soNguoiSuDung : 1;
      return {
        dichVuId: dichVu._id,
        maDichVu: dichVu.maDichVu,
        tenDichVu: dichVu.tenDichVu,
        donViTinh: dichVu.donViTinh,
        soLuong,
        donGia: dichVu.donGia,
      };
    });

  const tienDien = Number(chiSo.dien?.thanhTien || 0);
  const tienNuoc = Number(chiSo.nuoc?.thanhTien || 0);
  const tienPhong = Number(hopDong?.giaThueThang ?? phong.giaThue ?? 0);
  if (tienPhong <= 0) throw taoLoiHttp(422, `Phòng ${phong.soPhong || ''} chưa có giá thuê hợp lệ.`);
  const hanMacDinh = new Date(nam, thang, 10);

  return {
    chuTroId,
    dayTroId: phong.dayTroId,
    phongTroId: phong._id,
    hopDongId: hopDong?._id || null,
    nguoiThueIds: await layNguoiO({ phongTroId: phong._id, chuTroId, hopDong }),
    chiSoDienNuocId: chiSo._id,
    thang,
    nam,
    hanThanhToan: hanThanhToan || hanMacDinh,
    tienPhong,
    tienDien,
    chiTietDien: snapshotDongHo(chiSo.dien),
    tienNuoc,
    chiTietNuoc: snapshotDongHo(chiSo.nuoc),
    cacKhoanThu,
    ghiChu,
    nguoiTaoId: chuTroId,
  };
}

module.exports = { taoDuLieuHoaDon };
