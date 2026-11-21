const express = require('express');
const c = require('../controllers/bang_tin_controller');
const { body, param, kiemTraDuLieu, yeuCauChuTro, yeuCauDangNhap } = require('./hung_route_helpers');

const router = express.Router();
router.get('/', c.layDanhSach);
router.get('/cua-toi', yeuCauDangNhap, c.layCuaToi);
router.get('/:maBaiViet', c.layChiTiet);
router.post('/', yeuCauChuTro, [
  body('tieuDe').trim().isLength({ min: 5, max: 180 }).withMessage('Tiêu đề cần từ 5 đến 180 ký tự.'),
  body('noiDung').trim().isLength({ min: 10, max: 50000 }).withMessage('Nội dung cần từ 10 đến 50000 ký tự.'),
  kiemTraDuLieu,
], c.taoMoi);
router.put('/:maBaiViet', yeuCauChuTro, [param('maBaiViet').isMongoId().withMessage('Mã bài viết không hợp lệ.'), kiemTraDuLieu], c.capNhat);
router.delete('/:maBaiViet', yeuCauChuTro, [param('maBaiViet').isMongoId().withMessage('Mã bài viết không hợp lệ.'), kiemTraDuLieu], c.xoa);

module.exports = router;
