const express = require('express');
const router = express.Router();
const { xacThuc } = require('../middleware/xac_thuc');
const {
  layDanhSachDayTro,
  layChiTietDayTro,
  taoDayTro,
  capNhatDayTro,
  xoaDayTro,
} = require('../controllers/day_tro_controller');

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

router.get('/', layDanhSachDayTro);
router.get('/:maDayTro', layChiTietDayTro);
router.post('/', taoDayTro);
router.put('/:maDayTro', capNhatDayTro);
router.delete('/:maDayTro', xoaDayTro);

module.exports = router;