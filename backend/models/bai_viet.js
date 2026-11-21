const mongoose = require('mongoose');

const { Schema } = mongoose;

const baiVietSchema = new Schema({
  tacGiaId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
  loaiBaiViet: {
    type: String,
    enum: ['TIN_TUC', 'SU_KIEN', 'CONG_DONG'],
    default: 'TIN_TUC',
  },
  tieuDe: { type: String, required: true, trim: true, minlength: 5, maxlength: 180 },
  slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 220 },
  tomTat: { type: String, trim: true, maxlength: 500, default: '' },
  noiDung: { type: String, required: true, trim: true, minlength: 10, maxlength: 50000 },
  anhDaiDien: { type: String, trim: true, default: '' },
  hinhAnh: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  trangThai: {
    type: String,
    enum: ['NHAP', 'CHO_DUYET', 'DA_DANG', 'DA_AN', 'TU_CHOI'],
    default: 'NHAP',
    index: true,
  },
  ghimLenDau: { type: Boolean, default: false },
  ngayBatDauSuKien: { type: Date, default: null },
  ngayKetThucSuKien: { type: Date, default: null },
  ngayDang: { type: Date, default: null },
  nguoiDuyetId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', default: null },
  lyDoTuChoi: { type: String, trim: true, maxlength: 1000, default: '' },
  luotXem: { type: Number, min: 0, default: 0 },
}, {
  timestamps: true,
  versionKey: false,
});

baiVietSchema.pre('validate', function kiemTraNgaySuKien() {
  if (!this.slug && this.tieuDe) {
    const slugTieuDe = this.tieuDe
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    this.slug = `${slugTieuDe}-${this._id.toString().slice(-6)}`;
  }
  if (this.trangThai === 'DA_DANG' && !this.ngayDang) this.ngayDang = new Date();

  if (this.ngayBatDauSuKien && this.ngayKetThucSuKien
    && this.ngayKetThucSuKien < this.ngayBatDauSuKien) {
    this.invalidate('ngayKetThucSuKien', 'Ngày kết thúc sự kiện phải sau ngày bắt đầu.');
  }
});

baiVietSchema.index({ slug: 1 }, { unique: true });
baiVietSchema.index({ tacGiaId: 1, trangThai: 1, updatedAt: -1 });
baiVietSchema.index({ trangThai: 1, ngayDang: -1, ghimLenDau: -1 });
baiVietSchema.index({ tieuDe: 'text', tomTat: 'text', noiDung: 'text', tags: 'text' });

module.exports = mongoose.models.BaiViet || mongoose.model('BaiViet', baiVietSchema, 'baiviets');
