const mongoose = require('mongoose');

const hoSoOGhepSchema = new mongoose.Schema(
  {
    nguoiDangId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: true,
    },
    // nếu người đăng đã thuê phòng trong hệ thống thì gắn phongId,chưa có thì để null
    phongId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PhongTro',
      default: null,
    },
    tieuDe: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề tìm ở ghép'],
      trim: true,
    },
    khuVucMongMuon: {
      type: String,
      required: [true, 'Vui lòng nhập khu vực mong muốn'],
      trim: true,
    },
    giaMongMuon: {
      type: Number,
      required: [true, 'Vui lòng nhập mức giá chia sẻ mong muốn'],
    },
    gioiTinhYeuCau: {
      type: String,
      enum: ['nam', 'nu', 'khong_yeu_cau'],
      default: 'khong_yeu_cau',
    },
    moTaBanThan: {
      type: String,
      default: '',
    },
    thoiQuenSinhHoat: {
      type: String,
      default: '', // Ví dụ: Không hút thuốc, ngủ sớm, sạch sẽ...
    },
    // tọa độ phục vụ hiển thị trên bản đồ tìm ở ghép
    toaDo: {
      lat: { type: Number, default: 21.0285 },
      lng: { type: Number, default: 105.8542 },
    },
    trangThai: {
      type: String,
      enum: ['dang_tim', 'da_tim_duoc', 'an_tin'],
      default: 'dang_tim',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HoSoOGhep', hoSoOGhepSchema);