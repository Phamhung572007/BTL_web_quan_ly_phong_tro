const { param, body, query } = require('express-validator');
const kiemTraDuLieu = require('../middleware/kiem_tra_du_lieu');
const { yeuCauDangNhap, yeuCauChuTro } = require('../middleware/yeu_cau_quyen_chu_tro');

module.exports = { param, body, query, kiemTraDuLieu, yeuCauDangNhap, yeuCauChuTro };
