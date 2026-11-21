const express = require('express');
const c = require('../controllers/dich_vu_controller');
const { body, kiemTraDuLieu, yeuCauChuTro } = require('./hung_route_helpers');

const router = express.Router();
router.use(yeuCauChuTro);
router.get('/', c.layDanhSach);
router.get('/:maDichVu', c.layChiTiet);
router.post('/', [
  body('maDichVu').trim().notEmpty().withMessage('Mã dịch vụ là bắt buộc.'),
  body('tenDichVu').trim().notEmpty().withMessage('Tên dịch vụ là bắt buộc.'),
  body('donViTinh').trim().notEmpty().withMessage('Đơn vị tính là bắt buộc.'),
  body('donGia').isFloat({ min: 0 }).withMessage('Đơn giá phải là số không âm.'),
  body('cachTinh').isIn(['THEO_DONG_HO', 'THEO_NGUOI', 'CO_DINH', 'THEO_PHONG']).withMessage('Cách tính không hợp lệ.'),
  body('cachApGia').optional().isIn(['BAC_THANG', 'DON_GIA_BAC_2']).withMessage('Cách áp giá không hợp lệ.'),
  kiemTraDuLieu,
], c.taoMoi);
router.put('/:maDichVu', [
  body('donGia').optional().isFloat({ min: 0 }).withMessage('Đơn giá phải là số không âm.'),
  kiemTraDuLieu,
], c.capNhat);
router.delete('/:maDichVu', c.xoa);

module.exports = router;
