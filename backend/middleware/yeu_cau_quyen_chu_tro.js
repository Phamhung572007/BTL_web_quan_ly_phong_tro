const { guiThatBai } = require('../utils/phan_hoi_api');
const xacThucModule = require('./xac_thuc');

function layNguoiDung(req) {
  return req.user || req.nguoiDung || req.taiKhoan || null;
}

function layNguoiDungId(req) {
  const nguoiDung = layNguoiDung(req);
  return nguoiDung?._id || nguoiDung?.id || nguoiDung?.nguoiDungId || null;
}

function laChuTro(req) {
  const vaiTro = String(layNguoiDung(req)?.vaiTro || layNguoiDung(req)?.role || '').toUpperCase();
  return ['CHU_TRO', 'CHỦ_TRỌ', 'QUAN_TRI', 'ADMIN'].includes(vaiTro);
}

function timMiddlewareXacThuc() {
  if (typeof xacThucModule === 'function') return xacThucModule;
  return xacThucModule.xacThuc
    || xacThucModule.xacThucJWT
    || xacThucModule.kiemTraToken
    || xacThucModule.authenticateToken
    || null;
}

function yeuCauDangNhap(req, res, next) {
  if (layNguoiDungId(req)) return next();
  const xacThuc = timMiddlewareXacThuc();
  if (xacThuc) {
    return xacThuc(req, res, () => {
      if (layNguoiDungId(req)) return next();
      return guiThatBai(res, { statusCode: 401, message: 'Phiên đăng nhập không hợp lệ.' });
    });
  }
  if (!layNguoiDungId(req)) {
    return guiThatBai(res, {
      statusCode: 401,
      message: 'Bạn cần đăng nhập để thực hiện thao tác này.',
    });
  }
  return next();
}

function yeuCauChuTro(req, res, next) {
  return yeuCauDangNhap(req, res, () => {
    if (!laChuTro(req)) {
      return guiThatBai(res, { statusCode: 403, message: 'Chức năng này chỉ dành cho chủ trọ.' });
    }
    return next();
  });
}

function taoLoiHttp(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = {
  layNguoiDung,
  layNguoiDungId,
  laChuTro,
  yeuCauDangNhap,
  yeuCauChuTro,
  taoLoiHttp,
};
