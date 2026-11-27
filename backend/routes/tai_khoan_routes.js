const express = require('express');
const router = express.Router();
const { xacThuc } = require('../middleware/xac_thuc');
const { layThongTinCaNhan, capNhatThongTin } = require('../controllers/tai_khoan_controller');

router.get('/', xacThuc, layThongTinCaNhan);
router.put('/', xacThuc, capNhatThongTin);

module.exports = router;