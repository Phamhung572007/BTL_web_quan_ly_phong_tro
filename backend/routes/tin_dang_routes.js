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


const xacThucTuyChon = (req, res, next) => {
  if (req.headers.authorization) {
    return xacThuc(req, res, next);
  }
  next();
};


router.get('/', xacThucTuyChon, layDanhSachTinDang);
router.get('/:maTinDang', layChiTietTinDang);


router.post('/', xacThuc, chiChuTro, taoTinDang);
router.put('/:maTinDang', xacThuc, chiChuTro, capNhatTinDang);
router.patch('/:maTinDang/trang-thai', xacThuc, chiChuTro, doiTrangThaiTinDang);
router.delete('/:maTinDang', xacThuc, chiChuTro, xoaTinDang);

module.exports = router;