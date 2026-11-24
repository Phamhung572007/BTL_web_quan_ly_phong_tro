const mongoose = require('mongoose');

const { Schema } = mongoose;

const lichSuLichSchema = new Schema({
  nguoiThucHienId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
  thoiGianDeXuat: { type: Date, required: true },
  ghiChu: { type: String, trim: true, maxlength: 500, default: '' },
  taoLuc: { type: Date, default: Date.now },
}, { _id: true });

const lichXemSchema = new Schema({
  tinDangId: { type: Schema.Types.ObjectId, ref: 'TinDangPhong', default: null },
  phongTroId: { type: Schema.Types.ObjectId, ref: 'PhongTro', required: true },
  dayTroId: { type: Schema.Types.ObjectId, ref: 'DayTro', required: true },
  chuTroId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
  nguoiDatId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
  nguoiThueId: { type: Schema.Types.ObjectId, ref: 'NguoiThue', default: null },
  thoiGianMongMuon: { type: Date, required: true },
  thoiGianDaDuyet: { type: Date, default: null },
  trangThai: {
    type: String,
    enum: ['CHO_XAC_NHAN', 'DA_DUYET', 'DE_XUAT_DOI_LICH', 'DA_XAC_NHAN', 'DA_HOAN_TAT', 'DA_HUY', 'TU_CHOI'],
    default: 'CHO_XAC_NHAN',
    index: true,
  },
  ghiChuNguoiDat: { type: String, trim: true, maxlength: 1000, default: '' },
  ghiChuChuTro: { type: String, trim: true, maxlength: 1000, default: '' },
  lichSuDoiLich: { type: [lichSuLichSchema], default: [] },
  lyDoHuy: { type: String, trim: true, maxlength: 500, default: '' },
}, {
  timestamps: true,
  versionKey: false,
});

lichXemSchema.pre('validate', function kiemTraThoiGian() {
  if (this.isNew && this.thoiGianMongMuon && this.thoiGianMongMuon < new Date()) {
    this.invalidate('thoiGianMongMuon', 'Thời gian xem phòng phải ở hiện tại hoặc tương lai.');
  }
});

lichXemSchema.index({ chuTroId: 1, trangThai: 1, thoiGianMongMuon: 1 });
lichXemSchema.index({ nguoiDatId: 1, trangThai: 1, thoiGianMongMuon: 1 });
lichXemSchema.index({ phongTroId: 1, thoiGianMongMuon: 1 });

module.exports = mongoose.models.LichXem || mongoose.model('LichXem', lichXemSchema, 'lichxems');
