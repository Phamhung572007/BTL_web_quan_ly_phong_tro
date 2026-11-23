const mongoose = require('mongoose');

const phongTroSchema = new mongoose.Schema(
  {
    chuTroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: [true, 'Thiếu thông tin chủ trọ'],
      index: true,
    },
    dayTroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DayTro',
      required: [true, 'Phòng trọ phải thuộc một dãy trọ'],
      index: true,
    },
    soPhong: {
      type: String,
      required: [true, 'Số phòng/tên phòng không được để trống'],
      trim: true,
    },
    tang: {
      type: Number,
      default: 1,
      min: [0, 'Tầng không hợp lệ'],
    },
    giaThue: {
      type: Number,
      required: [true, 'Giá thuê phòng không được để trống'],
      min: [0, 'Giá thuê không được âm'],
    },
    tienCocMacDinh: {
      type: Number,
      default: 0,
      min: [0, 'Tiền cọc không được âm'],
    },
    dienTich: {
      type: Number,
      required: [true, 'Diện tích phòng không được để trống'],
      min: [1, 'Diện tích phải lớn hơn 0'],
    },
    soNguoiToiDa: {
      type: Number,
      default: 2,
      min: [1, 'Số người tối đa ít nhất là 1'],
    },
    noiThat: {
      type: [String], // VD: ['Điều hòa', 'Nóng lạnh', 'Giường', 'Tủ quần áo', 'Kệ bếp']
      default: [],
    },
    hinhAnh: {
      type: [String],
      default: [],
    },
    moTa: {
      type: String,
      trim: true,
      default: '',
    },
    trangThai: {
      type: String,
      enum: {
        values: ['TRONG', 'DANG_O', 'BAO_TRI'],
        message: 'Trạng thái phòng chỉ nhận TRONG, DANG_O hoặc BAO_TRI',
      },
      default: 'TRONG',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Không cho phép trùng số phòng trong cùng một dãy trọ
phongTroSchema.index({ dayTroId: 1, soPhong: 1 }, { unique: true });

module.exports = mongoose.model('PhongTro', phongTroSchema);