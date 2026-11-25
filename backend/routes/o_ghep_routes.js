const express = require('express');
const router = express.Router();
const { xacThuc } = require('../middleware/xac_thuc');
const {
  layDanhSachOGhep,
  taoHoSoOGhep,
  capNhatHoSoOGhep,
  xoaHoSoOGhep,
} = require('../controllers/o_ghep_controller');

router.get('/', layDanhSachOGhep);
router.post('/', xacThuc, taoHoSoOGhep);
router.put('/:id', xacThuc, capNhatHoSoOGhep);
router.delete('/:id', xacThuc, xoaHoSoOGhep);

module.exports = router;