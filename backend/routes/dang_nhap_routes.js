const express = require('express');
const router = express.Router();
const { xacThuc } = require('../middleware/xac_thuc');
const { dangKy, dangNhap, quenMatKhau, dangXuat } = require('../controllers/dang_nhap_controller');
const { doiMatKhau } = require('../controllers/tai_khoan_controller');

router.post('/dang-ky', dangKy);
router.post('/dang-nhap', dangNhap);
router.post('/quen-mat-khau', quenMatKhau);
router.post('/dang-xuat', xacThuc, dangXuat);
router.put('/doi-mat-khau', xacThuc, doiMatKhau);

module.exports = router;