const { validationResult } = require('express-validator');
const { guiThatBai } = require('../utils/phan_hoi_api');

function kiemTraDuLieu(req, res, next) {
  const ketQua = validationResult(req);
  if (ketQua.isEmpty()) return next();

  const errors = ketQua.array({ onlyFirstError: true }).map((loi) => ({
    field: loi.path || loi.param || 'request',
    message: loi.msg || 'Giá trị không hợp lệ.',
  }));

  return guiThatBai(res, {
    statusCode: 400,
    message: 'Dữ liệu gửi lên không hợp lệ.',
    data: { errors },
  });
}

module.exports = kiemTraDuLieu;
module.exports.kiemTraDuLieu = kiemTraDuLieu;
