const express = require('express');
const c = require('../controllers/hoa_don_controller');
const { body, param, kiemTraDuLieu, yeuCauChuTro } = require('./hung_route_helpers');

const router = express.Router();
router.use(yeuCauChuTro);
router.get('/', c.layDanhSach);
router.get('/phong/:maPhong', [param('maPhong').isMongoId().withMessage('Mã phòng không hợp lệ.'), kiemTraDuLieu], c.layTheoPhong);
router.get('/:maHoaDon', [param('maHoaDon').isMongoId().withMessage('Mã hóa đơn không hợp lệ.'), kiemTraDuLieu], c.layChiTiet);
router.post('/tao-tu-dong', [
  body('thang').isInt({ min: 1, max: 12 }),
  body('nam').isInt({ min: 2000, max: 2200 }),
  kiemTraDuLieu,
], c.taoTuDong);
router.post('/tao-moi', [
  body('phongTroId').isMongoId().withMessage('Mã phòng không hợp lệ.'),
  body('thang').isInt({ min: 1, max: 12 }),
  body('nam').isInt({ min: 2000, max: 2200 }),
  kiemTraDuLieu,
], c.taoMoi);
router.post('/', [
  body('phongTroId').isMongoId().withMessage('Mã phòng không hợp lệ.'),
  body('thang').isInt({ min: 1, max: 12 }),
  body('nam').isInt({ min: 2000, max: 2200 }),
  kiemTraDuLieu,
], c.taoMoi);
router.patch('/:maHoaDon/thanh-toan', [
  param('maHoaDon').isMongoId().withMessage('Mã hóa đơn không hợp lệ.'),
  body('soTien').optional().isFloat({ min: 1 }).withMessage('Số tiền thanh toán phải lớn hơn 0.'),
  kiemTraDuLieu,
], c.themThanhToan);
router.patch('/:maHoaDon', [
  param('maHoaDon').isMongoId().withMessage('Mã hóa đơn không hợp lệ.'),
  body('soTien').optional().isFloat({ min: 1 }).withMessage('Số tiền thanh toán phải lớn hơn 0.'),
  kiemTraDuLieu,
], c.themThanhToan);

module.exports = router;
