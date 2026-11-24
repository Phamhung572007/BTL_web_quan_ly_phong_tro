const express = require('express');
const router = express.Router();
const { xacThuc } = require('../middleware/xac_thuc');
const {
  layDanhSachHopDong,
  layChiTietHopDong,
  taoHopDong,
  capNhatHopDong,
  ketThucHopDong,
} = require('../controllers/hop_dong_controller');

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

router.get('/', layDanhSachHopDong);
router.get('/:maHopDong', layChiTietHopDong);
router.post('/', taoHopDong);
router.put('/:maHopDong', capNhatHopDong);
router.patch('/:maHopDong/ket-thuc', ketThucHopDong);

module.exports = router;