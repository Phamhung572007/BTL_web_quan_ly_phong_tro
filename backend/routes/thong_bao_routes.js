const express = require('express');
const c = require('../controllers/thong_bao_controller');
const { param, kiemTraDuLieu, yeuCauDangNhap } = require('./hung_route_helpers');

const router = express.Router();
router.use(yeuCauDangNhap);
router.get('/', c.layDanhSach);
router.get('/chua-doc', c.layChuaDoc);
router.patch('/da-doc-tat-ca', c.danhDauTatCa);
router.patch('/:maThongBao/da-doc', [param('maThongBao').isMongoId().withMessage('Mã thông báo không hợp lệ.'), kiemTraDuLieu], c.danhDauDaDoc);

module.exports = router;
