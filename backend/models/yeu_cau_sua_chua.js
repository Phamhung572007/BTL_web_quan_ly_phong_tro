const mongoose = require('mongoose');

const yeuCauSuaChuaSchema = new mongoose.Schema(
  {
    phongId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PhongTro',
      required: [true, 'Thiếu thông tin phòng trọ'],
    },
    nguoiGuiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: [true, 'Thiếu thông tin người gửi'],
    },
    chuTroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: [true, 'Thiếu thông tin chủ trọ'],
    },
    tieuDe: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề sự cố'],
      trim: true,
    },
    moTa: {
      type: String,
      required: [true, 'Vui lòng mô tả chi tiết sự cố'],
    },
    hinhAnh: [
      {
        type: String, // Mảng đường dẫn ảnh từ API upload Multer
      },
    ],
    mucDoUuTien: {
      type: String,
      enum: ['thap', 'trung_binh', 'khan_cap'],
      default: 'trung_binh',
    },
    trangThai: {
      type: String,
      enum: ['cho_xu_ly', 'dang_sua', 'hoan_thanh', 'tu_choi'],
      default: 'cho_xu_ly',
    },
    phanHoiChuTro: {
      type: String,
      default: '',
    },
    chiPhiSuaChua: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('YeuCauSuaChua', yeuCauSuaChuaSchema);