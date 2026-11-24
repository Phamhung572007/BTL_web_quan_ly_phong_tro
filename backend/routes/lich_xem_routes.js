const express = require('express');
const c = require('../controllers/lich_xem_controller');
const { body, param, kiemTraDuLieu, yeuCauDangNhap } = require('./hung_route_helpers');

const router = express.Router();
router.use(yeuCauDangNhap);
router.get('/', c.layDanhSach);
router.get('/:maLichXem', [param('maLichXem').isMongoId().withMessage('Mã lịch xem không hợp lệ.'), kiemTraDuLieu], c.layChiTiet);
router.post('/', [
  body('phongTroId').isMongoId().withMessage('Mã phòng không hợp lệ.'),
  body('thoiGianMongMuon').isISO8601().withMessage('Thời gian mong muốn không hợp lệ.'),
  kiemTraDuLieu,
], c.taoMoi);
router.patch('/:maLichXem/duyet', [
  param('maLichXem').isMongoId().withMessage('Mã lịch xem không hợp lệ.'),
  body('thoiGianDaDuyet').optional().isISO8601(),
  kiemTraDuLieu,
], c.duyet);
router.patch('/:maLichXem/doi-lich', [
  param('maLichXem').isMongoId().withMessage('Mã lịch xem không hợp lệ.'),
  body('thoiGianDeXuat').optional().isISO8601(),
  body('thoiGianMongMuon').optional().isISO8601(),
  body('xacNhan').optional().isBoolean(),
  kiemTraDuLieu,
], c.doiLich);
router.patch('/:maLichXem/huy', [param('maLichXem').isMongoId().withMessage('Mã lịch xem không hợp lệ.'), kiemTraDuLieu], c.huy);

module.exports = router;
