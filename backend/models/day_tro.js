const mongoose = require('mongoose');

const dayTroSchema = new mongoose.Schema(
  {
    chuTroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: [true, 'Thiếu thông tin chủ trọ sở hữu'],
      index: true,
    },
    tenDayTro: {
      type: String,
      required: [true, 'Tên dãy trọ không được để trống'],
      trim: true,
    },
    diaChi: {
      soNhaDuong: { type: String, required: [true, 'Địa chỉ chi tiết không được để trống'], trim: true },
      phuongXa: { type: String, trim: true, default: '' },
      quanHuyen: { type: String, required: [true, 'Quận/Huyện không được để trống'], trim: true },
      tinhThanh: { type: String, required: [true, 'Tỉnh/Thành phố không được để trống'], trim: true },
    },
    // Lưu tọa độ chuẩn GeoJSON [kinhDo (lng), viDo (lat)] để truy vấn khoảng cách bán kính
    viTri: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [105.8342, 21.0278], // Mặc định Hà Nội nếu chưa ghim bản đồ
      },
    },
    moTa: {
      type: String,
      trim: true,
      default: '',
    },
    quyDinhChung: {
      type: String,
      trim: true,
      default: '',
    },
    tienIchChung: {
      type: [String], // VD: ['Bãi giữ xe', 'Camera 24/7', 'Cổng vân tay', 'Thang máy']
      default: [],
    },
    anhDaiDien: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

dayTroSchema.index({ viTri: '2dsphere' });
dayTroSchema.index({ 'diaChi.tinhThanh': 1, 'diaChi.quanHuyen': 1 });

module.exports = mongoose.model('DayTro', dayTroSchema);