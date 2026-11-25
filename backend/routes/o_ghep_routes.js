const express = require('express');
const router = express.Router();
const { xacThuc } = require('../middleware/xac_thuc');
const {
  layDanhSachOGhep,
  layHoSoCuaToi,
  layChiTietHoSoOGhep,
  taoHoSoOGhep,
  capNhatHoSoCuaToi,
  xoaHoSoCuaToi,
} = require('../controllers/o_ghep_controller');

router.get('/', layDanhSachOGhep);
router.get('/cua-toi', xacThuc, layHoSoCuaToi);
router.get('/:maHoSo', layChiTietHoSoOGhep);
router.post('/', xacThuc, taoHoSoOGhep);
router.put('/cua-toi', xacThuc, capNhatHoSoCuaToi);
router.delete('/cua-toi', xacThuc, xoaHoSoCuaToi);

module.exports = router;