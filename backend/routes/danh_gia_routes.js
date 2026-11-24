const express = require('express');
const c = require('../controllers/danh_gia_controller');
const { body, param, kiemTraDuLieu, yeuCauDangNhap, yeuCauChuTro } = require('./hung_route_helpers');

const router = express.Router();
router.get('/', c.layDanhSach);
router.get('/quan-ly', yeuCauChuTro, c.layDanhSachCuaToi);
router.get('/:maDanhGia', [param('maDanhGia').isMongoId().withMessage('Mã đánh giá không hợp lệ.'), kiemTraDuLieu], c.layChiTiet);
router.post('/', yeuCauDangNhap, [
  body('phongTroId').optional().isMongoId(),
  body('maPhong').optional().isMongoId(),
  body('diem').isInt({ min: 1, max: 5 }).withMessage('Điểm đánh giá phải từ 1 đến 5.'),
  body('noiDung').trim().isLength({ min: 10, max: 5000 }).withMessage('Nội dung đánh giá cần từ 10 đến 5000 ký tự.'),
  kiemTraDuLieu,
], c.taoMoi);
router.put('/:maDanhGia', yeuCauDangNhap, [param('maDanhGia').isMongoId().withMessage('Mã đánh giá không hợp lệ.'), kiemTraDuLieu], c.capNhat);
router.delete('/:maDanhGia', yeuCauDangNhap, [param('maDanhGia').isMongoId().withMessage('Mã đánh giá không hợp lệ.'), kiemTraDuLieu], c.xoa);

module.exports = router;
