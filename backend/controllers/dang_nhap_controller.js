const bcrypt = require('bcryptjs');
const NguoiDung = require('../models/nguoi_dung');
const generateToken = require('../utils/generateToken');
const { guiThanhCong, guiThatBai } = require('../utils/phan_hoi_api');

// POST /api/dang-ky
const dangKy = async (req, res, next) => {
  try {
    const { hoTen, email, matKhau, soDienThoai, vaiTro } = req.body;

    if (!hoTen || !email || !matKhau || !soDienThoai) {
      return guiThatBai(res, {
        statusCode: 400,
        message: 'Vui lòng nhập đầy đủ thông tin.',
      });
    }

    const tonTai = await NguoiDung.findOne({ email: email.toLowerCase().trim() });
    if (tonTai) {
      return guiThatBai(res, {
        statusCode: 409,
        message: 'Email này đã được sử dụng.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const matKhauMaHoa = await bcrypt.hash(matKhau, salt);

    const nguoiDung = await NguoiDung.create({
      hoTen,
      email,
      matKhau: matKhauMaHoa,
      soDienThoai,
      vaiTro: vaiTro === 'CHU_TRO' ? 'CHU_TRO' : 'KHACH_THUE',
    });

    const token = generateToken(nguoiDung._id, nguoiDung.vaiTro);

    return guiThanhCong(res, {
      statusCode: 201,
      message: 'Đăng ký tài khoản thành công.',
      data: {
        token,
        nguoiDung: {
          _id: nguoiDung._id,
          hoTen: nguoiDung.hoTen,
          email: nguoiDung.email,
          soDienThoai: nguoiDung.soDienThoai,
          anhDaiDien: nguoiDung.anhDaiDien,
          vaiTro: nguoiDung.vaiTro,
          trangThai: nguoiDung.trangThai,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/dang-nhap
const dangNhap = async (req, res, next) => {
  try {
    const { email, matKhau } = req.body;

    if (!email || !matKhau) {
      return guiThatBai(res, {
        statusCode: 400,
        message: 'Vui lòng nhập email và mật khẩu.',
      });
    }

    const nguoiDung = await NguoiDung.findOne({ email: email.toLowerCase().trim() });
    if (!nguoiDung || !(await bcrypt.compare(matKhau, nguoiDung.matKhau))) {
      return guiThatBai(res, {
        statusCode: 401,
        message: 'Email hoặc mật khẩu không chính xác.',
      });
    }

    if (nguoiDung.trangThai !== 'HOAT_DONG') {
      return guiThatBai(res, {
        statusCode: 403,
        message: 'Tài khoản của bạn đã bị khóa.',
      });
    }

    const token = generateToken(nguoiDung._id, nguoiDung.vaiTro);

    return guiThanhCong(res, {
      message: 'Đăng nhập thành công.',
      data: {
        token,
        nguoiDung: {
          _id: nguoiDung._id,
          hoTen: nguoiDung.hoTen,
          email: nguoiDung.email,
          soDienThoai: nguoiDung.soDienThoai,
          anhDaiDien: nguoiDung.anhDaiDien,
          vaiTro: nguoiDung.vaiTro,
          trangThai: nguoiDung.trangThai,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/quen-mat-khau
const quenMatKhau = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const soDienThoai = String(req.body?.soDienThoai || '').trim();
    const matKhauMoi = String(req.body?.matKhauMoi || '');

    if (!email || !soDienThoai || !matKhauMoi) {
      return guiThatBai(res, {
        statusCode: 400,
        message: 'Vui lòng nhập đầy đủ Email, Số điện thoại và Mật khẩu mới.',
      });
    }

    if (matKhauMoi.length < 6) {
      return guiThatBai(res, {
        statusCode: 400,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự.',
      });
    }

    const nguoiDung = await NguoiDung.findOne({ email, soDienThoai });
    if (!nguoiDung) {
      return guiThatBai(res, {
        statusCode: 404,
        message: 'Email hoặc số điện thoại không khớp với bất kỳ tài khoản nào.',
      });
    }

    if (nguoiDung.trangThai !== 'HOAT_DONG') {
      return guiThatBai(res, {
        statusCode: 403,
        message: 'Tài khoản của bạn đã bị khóa.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    nguoiDung.matKhau = await bcrypt.hash(matKhauMoi, salt);
    await nguoiDung.save();

    return guiThanhCong(res, {
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/dang-xuat
const dangXuat = (req, res) => {
  return guiThanhCong(res, { message: 'Đăng xuất thành công.' });
};

module.exports = { dangKy, dangNhap, quenMatKhau, dangXuat };