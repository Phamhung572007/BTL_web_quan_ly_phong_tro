const mongoose = require('mongoose');

const tamTruSchema = new mongoose.Schema(
  {
    maHoSo: { type: String, trim: true, default: '' },
    noiDangKy: { type: String, trim: true, default: '' },
    ngayDangKy: { type: Date, default: null },
    ngayHetHan: { type: Date, default: null },
    trangThai: { type: String, trim: true, default: 'CHUA_DANG_KY' },
  },
  { _id: false }
);

const nguoiThueSchema = new mongoose.Schema(
  {
    chuTroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: true,
      index: true,
    },
    taiKhoanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      default: null,
      index: true,
    },
    phongTroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PhongTro',
      default: null,
      index: true,
    },
    hoTen: { type: String, trim: true, required: true },
    soDienThoai: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    cccd: { type: String, trim: true, default: '' },
    ngaySinh: { type: Date, default: null },
    gioiTinh: { type: String, trim: true, default: '' },
    queQuan: { type: String, trim: true, default: '' },
    diaChiThuongTru: { type: String, trim: true, default: '' },
    ngayVaoO: { type: Date, default: null },
    ngayRoiDi: { type: Date, default: null },
    tamTru: { type: tamTruSchema, default: () => ({}) },
    trangThai: { type: String, trim: true, default: 'CHUA_O', required: true },
    ghiChu: { type: String, trim: true, default: '' },
  },
  { timestamps: true, collection: 'nguoithues' }
);

nguoiThueSchema.index({ chuTroId: 1, trangThai: 1 });
nguoiThueSchema.index({ phongTroId: 1, trangThai: 1 });

module.exports = mongoose.models.NguoiThue
  || mongoose.model('NguoiThue', nguoiThueSchema);
