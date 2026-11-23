const mongoose = require('mongoose');

const tinDangPhongSchema = new mongoose.Schema(
  {
    chuTroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: [true, 'Thiếu thông tin chủ trọ đăng tin'],
      index: true,
    },
    phongTroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PhongTro',
      required: [true, 'Tin đăng phải gắn với một phòng trọ cụ thể'],
      index: true,
    },
    dayTroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DayTro',
      required: [true, 'Thiếu thông tin dãy trọ'],
    },
    tieuDe: {
      type: String,
      required: [true, 'Tiêu đề tin đăng không được để trống'],
      trim: true,
      maxlength: [150, 'Tiêu đề tối đa 150 ký tự'],
    },
    moTaChiTiet: {
      type: String,
      required: [true, 'Mô tả chi tiết không được để trống'],
      trim: true,
    },
    giaChoThue: {
      type: Number,
      required: [true, 'Giá cho thuê không được để trống'],
      min: [0, 'Giá cho thuê không hợp lệ'],
      index: true,
    },
    dienTich: {
      type: Number,
      required: [true, 'Diện tích không được để trống'],
      min: [1, 'Diện tích không hợp lệ'],
      index: true,
    },
    hinhAnh: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Tin đăng cần ít nhất 1 hình ảnh phòng',
      },
    },
    // Thông tin khu vực & tọa độ đồng bộ từ DayTro để phục vụ lọc/bản đồ công khai
    khuVuc: {
      diaChiDayDu: { type: String, trim: true, default: '' },
      quanHuyen: { type: String, trim: true, default: '', index: true },
      tinhThanh: { type: String, trim: true, default: '', index: true },
    },
    viTri: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [105.8342, 21.0278],
      },
    },
    soDienThoaiLienHe: {
      type: String,
      required: [true, 'Số điện thoại liên hệ không được để trống'],
      trim: true,
    },
    trangThai: {
      type: String,
      enum: {
        values: ['DANG_HIEN_THI', 'DA_AN'],
        message: 'Trạng thái tin chỉ nhận DANG_HIEN_THI hoặc DA_AN',
      },
      default: 'DANG_HIEN_THI',
      index: true,
    },
    noiBat: {
      type: Boolean,
      default: false,
    },
    luotXem: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

tinDangPhongSchema.index({ viTri: '2dsphere' });
tinDangPhongSchema.index({ tieuDe: 'text', moTaChiTiet: 'text', 'khuVuc.diaChiDayDu': 'text' });

module.exports = mongoose.model('TinDangPhong', tinDangPhongSchema);