const express = require('express');
const c = require('../controllers/dien_nuoc_controller');
const { body, param, kiemTraDuLieu, yeuCauChuTro } = require('./hung_route_helpers');

const router = express.Router();
router.use(yeuCauChuTro);
router.get('/', c.layDanhSach);
router.get('/phong/:maPhong', [param('maPhong').isMongoId().withMessage('Mã phòng không hợp lệ.'), kiemTraDuLieu], c.layLichSuPhong);
router.get('/:maChiSo', [param('maChiSo').isMongoId().withMessage('Mã chỉ số không hợp lệ.'), kiemTraDuLieu], c.layChiTiet);
router.post('/nhap-hang-loat', [
  body('thang').isInt({ min: 1, max: 12 }),
  body('nam').isInt({ min: 2000, max: 2200 }),
  body('items').isArray({ min: 1, max: 100 }),
  kiemTraDuLieu,
], c.nhapHangLoat);
router.post('/', [
  body('phongTroId').isMongoId().withMessage('Mã phòng không hợp lệ.'),
  body('thang').isInt({ min: 1, max: 12 }),
  body('nam').isInt({ min: 2000, max: 2200 }),
  body('dien.chiSoCu').isFloat({ min: 0 }),
  body('dien.chiSoMoi').isFloat({ min: 0 }),
  body('nuoc.chiSoCu').isFloat({ min: 0 }),
  body('nuoc.chiSoMoi').isFloat({ min: 0 }),
  kiemTraDuLieu,
], c.taoMoi);
router.put('/:maChiSo', [param('maChiSo').isMongoId().withMessage('Mã chỉ số không hợp lệ.'), kiemTraDuLieu], c.capNhat);

module.exports = router;
