const mongoose = require('mongoose');

const hopDongSchema = new mongoose.Schema(
  {
    chuTroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: [true, 'Thiếu thông tin chủ trọ'],
      index: true,
    },
    phongTroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PhongTro',
      required: [true, 'Thiếu thông tin phòng trọ'],
      index: true,
    },
    // Mã người thuê đại diện ký hợp đồng (Model NguoiThue do TV3 quản lý)
    nguoiThueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiThue',
      required: [true, 'Thiếu thông tin người thuê đại diện'],
      index: true,
    },
    // Danh sách thành viên ở cùng (nếu có nhiều người ở chung phòng)
    danhSachNguoiO: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NguoiThue',
      },
    ],
    maHopDongSo: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    ngayBatDau: {
      type: Date,
      required: [true, 'Ngày bắt đầu hợp đồng không được để trống'],
    },
    ngayKetThuc: {
      type: Date,
      required: [true, 'Ngày kết thúc hợp đồng không được để trống'],
    },
    ngayThanhLyThucTe: {
      type: Date,
      default: null,
    },
    giaThueChot: {
      type: Number,
      required: [true, 'Giá thuê theo hợp đồng không được để trống'],
      min: [0, 'Giá thuê không được âm'],
    },
    tienCoc: {
      type: Number,
      required: [true, 'Tiền đặt cọc không được để trống'],
      min: [0, 'Tiền cọc không được âm'],
    },
    chuKyThanhToan: {
      type: Number, // Số tháng đóng tiền 1 lần (1, 3, 6...)
      default: 1,
      min: 1,
    },
    ngayThuTienHangThang: {
      type: Number, // Ngày chốt hóa đơn/thu tiền hàng tháng (1 - 28)
      default: 5,
      min: 1,
      max: 28,
    },
    dieuKhoan: {
      type: String,
      trim: true,
      default: '',
    },
    trangThai: {
      type: String,
      enum: {
        values: ['HIEU_LUC', 'DA_KET_THUC', 'HUY'],
        message: 'Trạng thái hợp đồng chỉ nhận HIEU_LUC, DA_KET_THUC hoặc HUY',
      },
      default: 'HIEU_LUC',
      index: true,
    },
    ghiChuThanhLy: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

hopDongSchema.index({ phongTroId: 1, trangThai: 1 });

module.exports = mongoose.model('HopDong', hopDongSchema);