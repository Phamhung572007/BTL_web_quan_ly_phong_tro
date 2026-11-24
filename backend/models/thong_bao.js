const mongoose = require('mongoose');

const { Schema } = mongoose;

const thongBaoSchema = new Schema({
  nguoiNhanId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
  nguoiGuiId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', default: null },
  loaiThongBao: {
    type: String,
    enum: [
      'HOA_DON_MOI', 'THANH_TOAN', 'HOP_DONG', 'LICH_XEM', 'SUA_CHUA',
      'TIN_DANG', 'DANH_GIA', 'HE_THONG', 'KHAC',
    ],
    default: 'HE_THONG',
  },
  tieuDe: { type: String, required: true, trim: true, maxlength: 180 },
  noiDung: { type: String, required: true, trim: true, maxlength: 3000 },
  duongDan: { type: String, trim: true, maxlength: 500, default: '' },
  doiTuongModel: {
    type: String,
    enum: [
      'DayTro', 'PhongTro', 'NguoiThue', 'HopDong', 'DichVu', 'ChiSoDienNuoc',
      'HoaDon', 'YeuCauSuaChua', 'LichXem', 'TinDangPhong', 'HoSoOGhep',
      'BaiViet', 'DanhGiaPhong',
    ],
    default: undefined,
  },
  doiTuongId: { type: Schema.Types.ObjectId, refPath: 'doiTuongModel', default: null },
  daDocLuc: { type: Date, default: null },
  hetHanLuc: { type: Date, default: null },
  duLieuBoSung: { type: Schema.Types.Mixed, default: undefined },
}, {
  timestamps: true,
  versionKey: false,
});

thongBaoSchema.index({ nguoiNhanId: 1, createdAt: -1 });
thongBaoSchema.index({ nguoiNhanId: 1, daDocLuc: 1, createdAt: -1 });
module.exports = mongoose.models.ThongBao || mongoose.model('ThongBao', thongBaoSchema, 'thongbaos');
