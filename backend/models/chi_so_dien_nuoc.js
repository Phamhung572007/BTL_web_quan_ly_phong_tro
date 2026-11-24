const mongoose = require('mongoose');

const { Schema } = mongoose;

const bacGiaSchema = new Schema({
  bac: { type: Number, required: true, min: 1 },
  nguongTu: { type: Number, required: true, min: 0 },
  nguongDen: { type: Number, min: 0, default: null },
  donGia: { type: Number, required: true, min: 0 },
}, { _id: false });

const chiTietBacSchema = new Schema({
  bac: { type: Number, required: true, min: 1 },
  nguongTu: { type: Number, required: true, min: 0 },
  nguongDen: { type: Number, min: 0, default: null },
  soLuong: { type: Number, required: true, min: 0 },
  donGia: { type: Number, required: true, min: 0 },
  thanhTien: { type: Number, required: true, min: 0 },
}, { _id: false });

const dongHoSchema = new Schema({
  chiSoCu: { type: Number, required: true, min: 0 },
  chiSoMoi: { type: Number, required: true, min: 0 },
  tieuThu: { type: Number, min: 0, default: 0 },
  donGia: { type: Number, min: 0, default: 0 },
  thanhTien: { type: Number, min: 0, default: 0 },
  soNguoiSuDung: { type: Number, min: 0, default: 0 },
  soNguoiDinhMuc: { type: Number, min: 0.25, default: 1 },
  heSoDinhMuc: { type: Number, min: 0.25, default: 1 },
  cachApGia: { type: String, enum: ['BAC_THANG', 'DON_GIA_BAC_2'], default: 'BAC_THANG' },
  bacGia: { type: [bacGiaSchema], default: [] },
  chiTietBac: { type: [chiTietBacSchema], default: [] },
  ngayHieuLucGia: { type: Date, default: null },
  nguonGia: { type: String, trim: true, default: '' },
  giaChuaThue: { type: Boolean, default: true },
}, { _id: false });

const { tinhTienBacThang } = require('../services/tinh_tien_bac_thang');

const chiSoDienNuocSchema = new Schema({
  chuTroId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
  dayTroId: { type: Schema.Types.ObjectId, ref: 'DayTro', required: true },
  phongTroId: { type: Schema.Types.ObjectId, ref: 'PhongTro', required: true },
  thang: { type: Number, required: true, min: 1, max: 12 },
  nam: { type: Number, required: true, min: 2000, max: 2200 },
  dien: { type: dongHoSchema, required: true },
  nuoc: { type: dongHoSchema, required: true },
  ngayGhi: { type: Date, default: Date.now },
  nguoiGhiId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
  ghiChu: { type: String, trim: true, maxlength: 1000, default: '' },
}, {
  timestamps: true,
  versionKey: false,
});

chiSoDienNuocSchema.pre('validate', function tinhMucTieuThu() {
  for (const tenDongHo of ['dien', 'nuoc']) {
    const dongHo = this[tenDongHo];
    if (!dongHo) continue;
    if (dongHo.chiSoMoi < dongHo.chiSoCu) {
      this.invalidate(`${tenDongHo}.chiSoMoi`, 'Chỉ số mới không được nhỏ hơn chỉ số cũ.');
      continue;
    }
    dongHo.tieuThu = dongHo.chiSoMoi - dongHo.chiSoCu;
    if (dongHo.bacGia?.length) {
      try {
        const ketQua = tinhTienBacThang(
          dongHo.tieuThu,
          dongHo.bacGia,
          dongHo.heSoDinhMuc || 1,
          dongHo.cachApGia || 'BAC_THANG',
        );
        dongHo.chiTietBac = ketQua.chiTietBac;
        dongHo.thanhTien = ketQua.tongTien;
        dongHo.donGia = ketQua.donGiaBinhQuan;
      } catch (error) {
        this.invalidate(`${tenDongHo}.bacGia`, error.message);
      }
    } else {
      dongHo.thanhTien = dongHo.tieuThu * dongHo.donGia;
      dongHo.chiTietBac = [];
    }
  }
});

chiSoDienNuocSchema.index({ phongTroId: 1, nam: 1, thang: 1 }, { unique: true });
chiSoDienNuocSchema.index({ chuTroId: 1, nam: 1, thang: 1 });
chiSoDienNuocSchema.index({ dayTroId: 1, nam: 1, thang: 1 });

module.exports = mongoose.models.ChiSoDienNuoc
  || mongoose.model('ChiSoDienNuoc', chiSoDienNuocSchema, 'chisosdiennuocs');
