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
router.get('/:id', xacThuc, layChiTietNguoiThue);
router.post('/', xacThuc, phanQuyen('chu_tro', 'admin'), taoNguoiThue);
router.put('/:id', xacThuc, phanQuyen('chu_tro', 'admin'), capNhatNguoiThue);
router.delete('/:id', xacThuc, phanQuyen('chu_tro', 'admin'), xoaNguoiThue);

module.exports = router;