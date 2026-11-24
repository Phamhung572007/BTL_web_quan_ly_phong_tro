const ChiSoDienNuoc = require('../models/chi_so_dien_nuoc');
const DichVu = require('../models/dich_vu');
const { taoLoiHttp } = require('../middleware/yeu_cau_quyen_chu_tro');

async function demNguoiDangO(phongTroId) {
  const collection = ChiSoDienNuoc.db.collection('nguoithues');
  const soNguoi = await collection.countDocuments({ phongTroId, trangThai: 'DANG_O' });
  return Math.max(1, soNguoi);
}

async function layCauHinhDichVu({ chuTroId, dayTroId, loaiDichVu }) {
  const dieuKien = { chuTroId, loaiDichVu, dangApDung: true };
  if (dayTroId) {
    const riengDay = await DichVu.findOne({ ...dieuKien, dayTroId }).lean();
    if (riengDay) return riengDay;
  }
  return DichVu.findOne({ ...dieuKien, dayTroId: null }).lean();
}

async function taoDongHo({ chuTroId, phongTroId, dayTroId, loaiDichVu, duLieu }) {
  const cauHinh = await layCauHinhDichVu({ chuTroId, dayTroId, loaiDichVu });
  if (!cauHinh) {
    throw taoLoiHttp(422, `Chưa cấu hình đơn giá ${loaiDichVu === 'DIEN' ? 'điện' : 'nước'} áp dụng cho dãy trọ này.`);
  }

  const soNguoiSuDung = await demNguoiDangO(phongTroId);
  const donViDinhMuc = cauHinh.donViDinhMuc || 'DONG_HO_THANG';
  const heSoDinhMuc = donViDinhMuc === 'NGUOI_THANG'
    ? soNguoiSuDung
    : (loaiDichVu === 'DIEN' && donViDinhMuc === 'HO_DINH_MUC'
      ? Math.max(0.25, soNguoiSuDung / 4)
      : 1);

  return {
    chiSoCu: Number(duLieu?.chiSoCu),
    chiSoMoi: Number(duLieu?.chiSoMoi),
    donGia: Number(cauHinh.donGia) || 0,
    soNguoiSuDung,
    soNguoiDinhMuc: heSoDinhMuc,
    heSoDinhMuc,
    cachApGia: cauHinh.cachApGia || 'BAC_THANG',
    bacGia: (cauHinh.bacGia || []).map((bac) => ({
      bac: bac.bac,
      nguongTu: bac.nguongTu,
      nguongDen: bac.nguongDen,
      donGia: bac.donGia,
    })),
    ngayHieuLucGia: cauHinh.ngayHieuLucGia || null,
    nguonGia: cauHinh.nguonGia || '',
    giaChuaThue: cauHinh.giaChuaThue !== false,
  };
}

module.exports = { taoDongHo, layCauHinhDichVu };
