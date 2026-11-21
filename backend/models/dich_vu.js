const mongoose = require('mongoose');

const { Schema } = mongoose;

const bacGiaSchema = new Schema({
  bac: { type: Number, required: true, min: 1 },
  nguongTu: { type: Number, required: true, min: 0 },
  nguongDen: { type: Number, min: 0, default: null },
  donGia: { type: Number, required: true, min: 0 },
}, { _id: false });

const dichVuSchema = new Schema({
  chuTroId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
  dayTroId: { type: Schema.Types.ObjectId, ref: 'DayTro', default: null },
  maDichVu: { type: String, required: true, trim: true, uppercase: true, maxlength: 40 },
  tenDichVu: { type: String, required: true, trim: true, maxlength: 120 },
  loaiDichVu: {
    type: String,
    enum: ['DIEN', 'NUOC', 'INTERNET', 'RAC', 'GUI_XE', 'VE_SINH', 'KHAC'],
    default: 'KHAC',
  },
  donViTinh: { type: String, required: true, trim: true, maxlength: 40 },
  donGia: { type: Number, required: true, min: 0 },
  bacGia: { type: [bacGiaSchema], default: [] },
  donViDinhMuc: {
    type: String,
    enum: ['DONG_HO_THANG', 'NGUOI_THANG', 'HO_DINH_MUC'],
    default: 'DONG_HO_THANG',
  },
  ngayHieuLucGia: { type: Date, default: null },
  nguonGia: { type: String, trim: true, default: '' },
  giaChuaThue: { type: Boolean, default: true },
  cachTinh: {
    type: String,
    enum: ['THEO_DONG_HO', 'THEO_NGUOI', 'CO_DINH', 'THEO_PHONG'],
    required: true,
  },
  cachApGia: {
    type: String,
    enum: ['BAC_THANG', 'DON_GIA_BAC_2'],
    default: 'BAC_THANG',
  },
  batBuoc: { type: Boolean, default: false },
  dangApDung: { type: Boolean, default: true, index: true },
  moTa: { type: String, trim: true, maxlength: 1000, default: '' },
}, {
  timestamps: true,
  versionKey: false,
});

dichVuSchema.index({ chuTroId: 1, maDichVu: 1 }, { unique: true });
dichVuSchema.index({ chuTroId: 1, dayTroId: 1, dangApDung: 1 });

module.exports = mongoose.models.DichVu || mongoose.model('DichVu', dichVuSchema, 'dichvus');
