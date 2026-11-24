const mongoose = require('mongoose');

const { Schema } = mongoose;

const chiTietBacSchema = new Schema({
  bac: { type: Number, required: true, min: 1 },
  nguongTu: { type: Number, required: true, min: 0 },
  nguongDen: { type: Number, min: 0, default: null },
  soLuong: { type: Number, required: true, min: 0 },
  donGia: { type: Number, required: true, min: 0 },
  thanhTien: { type: Number, required: true, min: 0 },
}, { _id: false });

const chiTietCongToSchema = new Schema({
  chiSoCu: { type: Number, min: 0, default: 0 },
  chiSoMoi: { type: Number, min: 0, default: 0 },
  tieuThu: { type: Number, min: 0, default: 0 },
  donGia: { type: Number, min: 0, default: 0 },
  soNguoiSuDung: { type: Number, min: 0, default: 0 },
  soNguoiDinhMuc: { type: Number, min: 0.25, default: 1 },
  heSoDinhMuc: { type: Number, min: 0.25, default: 1 },
  cachApGia: { type: String, enum: ['BAC_THANG', 'DON_GIA_BAC_2'], default: 'BAC_THANG' },
  chiTietBac: { type: [chiTietBacSchema], default: [] },
  ngayHieuLucGia: { type: Date, default: null },
  nguonGia: { type: String, trim: true, default: '' },
  giaChuaThue: { type: Boolean, default: true },
}, { _id: false });

const dongHoaDonSchema = new Schema({
  dichVuId: { type: Schema.Types.ObjectId, ref: 'DichVu', default: null },
  maDichVu: { type: String, trim: true, default: '' },
  tenDichVu: { type: String, required: true, trim: true, maxlength: 120 },
  donViTinh: { type: String, trim: true, default: '' },
  soLuong: { type: Number, min: 0, default: 1 },
  donGia: { type: Number, required: true, min: 0 },
  thanhTien: { type: Number, min: 0, default: 0 },
}, { _id: false });

const thanhToanSchema = new Schema({
  soTien: { type: Number, required: true, min: 1 },
  phuongThuc: {
    type: String,
    enum: ['TIEN_MAT', 'CHUYEN_KHOAN', 'VI_DIEN_TU', 'KHAC'],
    default: 'TIEN_MAT',
  },
  maGiaoDich: { type: String, trim: true, default: '' },
  ghiChu: { type: String, trim: true, maxlength: 500, default: '' },
  nguoiNhanId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', default: null },
  thanhToanLuc: { type: Date, default: Date.now },
}, { _id: true });

const hoaDonSchema = new Schema({
  chuTroId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
  dayTroId: { type: Schema.Types.ObjectId, ref: 'DayTro', required: true },
  phongTroId: { type: Schema.Types.ObjectId, ref: 'PhongTro', required: true },
  hopDongId: { type: Schema.Types.ObjectId, ref: 'HopDong', default: null },
  nguoiThueIds: { type: [{ type: Schema.Types.ObjectId, ref: 'NguoiThue' }], default: [] },
  chiSoDienNuocId: { type: Schema.Types.ObjectId, ref: 'ChiSoDienNuoc', default: null },
  thang: { type: Number, required: true, min: 1, max: 12 },
  nam: { type: Number, required: true, min: 2000, max: 2200 },
  ngayLap: { type: Date, default: Date.now },
  hanThanhToan: { type: Date, required: true },
  tienPhong: { type: Number, required: true, min: 0 },
  tienDien: { type: Number, min: 0, default: 0 },
  chiTietDien: { type: chiTietCongToSchema, default: () => ({}) },
  tienNuoc: { type: Number, min: 0, default: 0 },
  chiTietNuoc: { type: chiTietCongToSchema, default: () => ({}) },
  cacKhoanThu: { type: [dongHoaDonSchema], default: [] },
  giamTru: { type: Number, min: 0, default: 0 },
  tongTien: { type: Number, min: 0, default: 0 },
  daThanhToan: { type: Number, min: 0, default: 0 },
  lichSuThanhToan: { type: [thanhToanSchema], default: [] },
  trangThai: {
    type: String,
    enum: ['CHUA_THANH_TOAN', 'THANH_TOAN_MOT_PHAN', 'DA_THANH_TOAN', 'QUA_HAN', 'HUY'],
    default: 'CHUA_THANH_TOAN',
    index: true,
  },
  ghiChu: { type: String, trim: true, maxlength: 2000, default: '' },
  nguoiTaoId: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
}, {
  timestamps: true,
  versionKey: false,
});

hoaDonSchema.pre('validate', function tinhTongHoaDon() {
  for (const khoanThu of this.cacKhoanThu || []) {
    khoanThu.thanhTien = khoanThu.soLuong * khoanThu.donGia;
  }

  const tienDichVu = (this.cacKhoanThu || []).reduce((tong, khoanThu) => tong + khoanThu.thanhTien, 0);
  if (this.chiTietDien?.chiTietBac?.length) {
    this.tienDien = this.chiTietDien.chiTietBac.reduce((tong, bac) => tong + bac.thanhTien, 0);
  }
  if (this.chiTietNuoc?.chiTietBac?.length) {
    this.tienNuoc = this.chiTietNuoc.chiTietBac.reduce((tong, bac) => tong + bac.thanhTien, 0);
  }
  const tongTruocGiam = this.tienPhong + this.tienDien + this.tienNuoc + tienDichVu;
  if (this.giamTru > tongTruocGiam) {
    this.invalidate('giamTru', 'Khoản giảm trừ không được lớn hơn tổng tiền trước giảm trừ.');
  }
  this.tongTien = Math.max(0, tongTruocGiam - this.giamTru);
  this.daThanhToan = (this.lichSuThanhToan || []).reduce((tong, lan) => tong + lan.soTien, 0);
  if (this.daThanhToan > this.tongTien) {
    this.invalidate('lichSuThanhToan', 'Tổng thanh toán không được lớn hơn tổng hóa đơn.');
  }

  if (this.trangThai !== 'HUY') {
    if (this.tongTien > 0 && this.daThanhToan >= this.tongTien) {
      this.trangThai = 'DA_THANH_TOAN';
    } else if (this.daThanhToan > 0) {
      this.trangThai = 'THANH_TOAN_MOT_PHAN';
    } else if (this.hanThanhToan && this.hanThanhToan < new Date()) {
      this.trangThai = 'QUA_HAN';
    } else {
      this.trangThai = 'CHUA_THANH_TOAN';
    }
  }
});

hoaDonSchema.index({ phongTroId: 1, nam: 1, thang: 1 }, { unique: true });
hoaDonSchema.index({ chuTroId: 1, nam: 1, thang: 1, trangThai: 1 });
hoaDonSchema.index({ nguoiThueIds: 1, trangThai: 1 });
hoaDonSchema.index({ hanThanhToan: 1, trangThai: 1 });

module.exports = mongoose.models.HoaDon || mongoose.model('HoaDon', hoaDonSchema, 'hoadons');
