const multer = require('multer');
const path = require('path');
const fs = require('fs');

//tự động tạo thư mục backend/uploads nếu chưa tồn tại
const thuMucUpload = path.join(__dirname, '../uploads');
if (!fs.existsSync(thuMucUpload)) {
  fs.mkdirSync(thuMucUpload, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, thuMucUpload);
  },
  filename: (req, file, cb) => {
    const tenGoc = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9]/g, '_');
    const duoiFile = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${tenGoc}${duoiFile}`);
  },
});

const fileFilter = (req, file, cb) => {
  const cacDinhDangAnh = /jpeg|jpg|png|webp/;
  const kiemTraDuoi = cacDinhDangAnh.test(path.extname(file.originalname).toLowerCase());
  const kiemTraMime = cacDinhDangAnh.test(file.mimetype);

  if (kiemTraDuoi && kiemTraMime) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận định dạng ảnh (jpg, jpeg, png, webp)!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tối đa 5MB/ảnh
});

module.exports = upload;