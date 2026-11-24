const express = require('express');
const router = express.Router();
const { xacThuc } = require('../middleware/xac_thuc');
const {
  layDanhSachPhongTro,
  layChiTietPhongTro,
  taoPhongTro,
  capNhatPhongTro,
  xoaPhongTro,
} = require('../controllers/phong_tro_controller');

const chiChuTro = (req, res, next) => {
  if (!req.user || req.user.vaiTro !== 'CHU_TRO') {
    return res.status(403).json({
      success: false,
      message: 'Chức năng này chỉ dành cho tài khoản Chủ trọ.',
      data: null,
    });
  }
  next();
};

router.use(xacThuc, chiChuTro);

router.get('/', layDanhSachPhongTro);
router.get('/:maPhong', layChiTietPhongTro);
router.post('/', taoPhongTro);
router.put('/:maPhong', capNhatPhongTro);
router.delete('/:maPhong', xoaPhongTro);

module.exports = router;