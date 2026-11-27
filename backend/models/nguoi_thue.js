const mongoose = require('mongoose');

const nguoiThueSchema = new mongoose.Schema(
  {
    // Liên kết tài khoản (có thể null nếu khách thuê lớn tuổi/không dùng app)
    nguoiDungId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      default: null,
    },
    // Chủ trọ đang quản lý hồ sơ khách này
    chuTroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: true,
    },
    // Phòng đang ở (tham chiếu sang model PhongTro của Thành viên 2)
    phongId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PhongTro',
      default: null,
    },
    hoTen: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên người thuê'],
      trim: true,
    },
    soDienThoai: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại'],
      trim: true,
    },
    cccd: {
      type: String,
      required: [true, 'Vui lòng nhập số CCCD/CMND'],
      trim: true,
    },
    ngaySinh: {
      type: Date,
    },
    gioiTinh: {
      type: String,
      enum: ['nam', 'nu', 'khac', 'NAM', 'NU', 'KHAC'],
      default: 'nam',
    },
    queQuan: {
      type: String,
      default: '',
    },
    anhCccdMatTruoc: {
      type: String,
      default: '',
    },
    anhCccdMatSau: {
      type: String,
      default: '',
    },
    trangThaiTamTru: {
      type: String,
      enum: ['chua_dang_ky', 'da_dang_ky', 'het_han', 'CHUA_DANG_KY', 'DA_DANG_KY', 'HET_HAN'],
      default: 'chua_dang_ky',
    },
    ngayHetHanTamTru: {
      type: Date,
    },
    ghiChu: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('NguoiThue', nguoiThueSchema);