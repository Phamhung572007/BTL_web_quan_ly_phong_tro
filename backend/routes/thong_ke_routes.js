const express = require('express');
const c = require('../controllers/thong_ke_controller');
const { query, kiemTraDuLieu, yeuCauChuTro } = require('./hung_route_helpers');

const router = express.Router();
router.use(yeuCauChuTro);
router.get('/tong-quan', c.tongQuan);
router.get('/doanh-thu', c.doanhThu);
router.get('/dieu-phoi-phong', [
  query('dayTroId').optional().isMongoId().withMessage('Mã dãy trọ không hợp lệ.'),
  query('tuKhoa').optional().trim().isLength({ max: 80 }).withMessage('Từ khóa không được dài quá 80 ký tự.'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  kiemTraDuLieu,
], c.layBanDieuPhoiPhong);
router.get('/phong-no-tien', c.phongNoTien);

module.exports = router;
