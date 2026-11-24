const mongoose = require('mongoose');

const nguoiDungSchema = new mongoose.Schema(
  {
    hoTen: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    matKhau: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu tối thiểu 6 ký tự'],
    },
    soDienThoai: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại'],
      trim: true,
    },
    anhDaiDien: {
      type: String,
      default: '',
    },
    vaiTro: {
      type: String,
      enum: ['chu_tro', 'khach_thue', 'admin'],
      default: 'khach_thue',
    },
    trangThai: {
      type: Boolean,
      default: true, // true: hoạt động, false: bị khóa
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('NguoiDung', nguoiDungSchema);