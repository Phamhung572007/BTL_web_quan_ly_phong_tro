const express = require('express');
const router = express.Router();
const { xacThuc } = require('../middleware/xac_thuc');
const {
  layDanhSachTinDang,
  layChiTietTinDang,
  taoTinDang,
  capNhatTinDang,
  doiTrangThaiTinDang,
  xoaTinDang,
} = require('../controllers/tin_dang_controller');

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

// Route công khai
router.get('/', layDanhSachTinDang);
router.get('/:maTinDang', layChiTietTinDang);

// Route quản trị dành cho Chủ trọ
router.post('/', xacThuc, chiChuTro, taoTinDang);
router.put('/:maTinDang', xacThuc, chiChuTro, capNhatTinDang);
router.patch('/:maTinDang/trang-thai', xacThuc, chiChuTro, doiTrangThaiTinDang);
router.delete('/:maTinDang', xacThuc, chiChuTro, xoaTinDang);

module.exports = router;