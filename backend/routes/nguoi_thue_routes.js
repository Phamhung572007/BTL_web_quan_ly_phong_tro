const express = require('express');
const router = express.Router();
const { xacThuc, phanQuyen } = require('../middleware/xac_thuc');
const {
  layDanhSachNguoiThue,
  layChiTietNguoiThue,
  taoNguoiThue,
  capNhatNguoiThue,
  xoaNguoiThue,
} = require('../controllers/nguoi_thue_controller');

router.get('/', xacThuc, layDanhSachNguoiThue);
router.get('/:maNguoiThue', xacThuc, layChiTietNguoiThue);
router.post('/', xacThuc, phanQuyen('CHU_TRO', 'ADMIN'), taoNguoiThue);
router.put('/:maNguoiThue', xacThuc, phanQuyen('CHU_TRO', 'ADMIN'), capNhatNguoiThue);
router.delete('/:maNguoiThue', xacThuc, phanQuyen('CHU_TRO', 'ADMIN'), xoaNguoiThue);

module.exports = router;