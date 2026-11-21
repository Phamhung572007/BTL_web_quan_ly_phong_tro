const mongoose = require('mongoose');

const { Schema } = mongoose;

const hinhAnhSchema = new Schema({
  url: { type: String, required: true, trim: true },
  moTa: { type: String, trim: true, default: '' },
}, { _id: false });

const danhGiaPhongSchema = new Schema({
  phongTroId: { type: Schema.Types.ObjectId, ref: 'PhongTro', required: true },
  tinDangId: { type: Schema.Types.ObjectId, ref: 'TinDangPhong', default: null },
  hopDongId: { type: Schema.Types.ObjectId, ref: 'HopDong', default: null },
  nguoiDanhGiaId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
  nguoiThueId: { type: Schema.Types.ObjectId, ref: 'NguoiThue', default: null },
  diem: { type: Number, required: true, min: 1, max: 5 },
  tieuDe: { type: String, trim: true, maxlength: 140, default: '' },
  noiDung: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
  hinhAnh: { type: [hinhAnhSchema], default: [] },
  trangThai: {
    type: String,
    enum: ['CHO_DUYET', 'DA_DUYET', 'DA_AN', 'TU_CHOI'],
    default: 'DA_DUYET',
    index: true,
  },
  phanHoiChuTro: {
    noiDung: { type: String, trim: true, maxlength: 2000, default: '' },
    nguoiPhanHoiId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', default: null },
    phanHoiLuc: { type: Date, default: null },
  },
  lyDoAn: { type: String, trim: true, maxlength: 1000, default: '' },
}, {
  timestamps: true,
  versionKey: false,
});

danhGiaPhongSchema.index({ phongTroId: 1, trangThai: 1, createdAt: -1 });
danhGiaPhongSchema.index({ nguoiDanhGiaId: 1, createdAt: -1 });
danhGiaPhongSchema.index(
  { hopDongId: 1 },
  { unique: true, partialFilterExpression: { hopDongId: { $type: 'objectId' } } },
);

module.exports = mongoose.models.DanhGiaPhong
  || mongoose.model('DanhGiaPhong', danhGiaPhongSchema, 'danhgiaphongs');
