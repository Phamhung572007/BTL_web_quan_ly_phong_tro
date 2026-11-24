const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { xacThuc } = require('../middleware/xac_thuc');

// POST /api/upload/anh
router.post('/anh', xacThuc, (req, res) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Lỗi khi tải ảnh lên!',
        data: null,
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất 1 hình ảnh!',
        data: null,
      });
    }

    const danhSachDuongDan = req.files.map((file) => `/uploads/${file.filename}`);

    return res.status(200).json({
      success: true,
      message: 'Tải ảnh lên thành công!',
      data: danhSachDuongDan,
    });
  });
});

module.exports = router;