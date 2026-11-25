const express = require('express');
const router = express.Router();
const { xacThuc, phanQuyen } = require('../middleware/xac_thuc');
const {
  layDanhSachSuaChua,
  taoYeuCauSuaChua,
  capNhatTrangThaiSuaChua,
} = require('../controllers/sua_chua_controller');

router.get('/', xacThuc, layDanhSachSuaChua);
router.post('/', xacThuc, phanQuyen('khach_thue'), taoYeuCauSuaChua);
router.patch('/:id', xacThuc, phanQuyen('chu_tro', 'admin'), capNhatTrangThaiSuaChua);

module.exports = router;