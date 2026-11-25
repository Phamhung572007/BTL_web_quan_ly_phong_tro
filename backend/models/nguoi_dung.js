const mongoose = require('mongoose');

const nguoiDungSchema = new mongoose.Schema(
  {
    hoTen: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true },
    soDienThoai: { type: String, trim: true, default: '' },
    matKhau: { type: String, required: true, select: false },
    vaiTro: {
      type: String,
      enum: ['CHU_TRO', 'KHACH_THUE', 'QUAN_TRI'],
      default: 'KHACH_THUE',
      required: true,
    },
    anhDaiDien: { type: String, trim: true, default: '' },
    trangThai: { type: String, trim: true, default: 'HOAT_DONG', required: true },
    emailDaXacThuc: { type: Boolean, default: false },
    lanDangNhapCuoi: { type: Date, default: null },
  },
  { timestamps: true, collection: 'nguoidungs' }
);

nguoiDungSchema.index({ email: 1 }, { unique: true });
nguoiDungSchema.index(
  { soDienThoai: 1 },
  { unique: true, partialFilterExpression: { soDienThoai: { $type: 'string', $gt: '' } } }
);

module.exports = mongoose.models.NguoiDung
  || mongoose.model('NguoiDung', nguoiDungSchema);
