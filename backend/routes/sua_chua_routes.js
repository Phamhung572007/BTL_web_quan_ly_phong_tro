const express = require('express');
const router = express.Router();
const { xacThuc, phanQuyen } = require('../middleware/xac_thuc');
const {
  layDanhSachSuaChua,
  layChiTietSuaChua,
  taoYeuCauSuaChua,
  capNhatTrangThaiSuaChua,
} = require('../controllers/sua_chua_controller');

router.get('/', xacThuc, layDanhSachSuaChua);
router.get('/:maYeuCau', xacThuc, layChiTietSuaChua);
router.post('/', xacThuc, phanQuyen('KHACH_THUE'), taoYeuCauSuaChua);
router.patch('/:maYeuCau/trang-thai', xacThuc, phanQuyen('CHU_TRO', 'ADMIN'), capNhatTrangThaiSuaChua);

module.exports = router;