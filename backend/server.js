const express = require('express');
const cors = require('cors');
const { ketNoiDatabase } = require('./config/ket_noi_database');
const xuLyLoi = require('./middleware/xu_ly_loi');
const { guiThanhCong, guiThatBai } = require('./utils/phan_hoi_api');

const cacRouteHung = [
  ['/api/dich-vu', require('./routes/dich_vu_routes')],
  ['/api/chi-so-dien-nuoc', require('./routes/dien_nuoc_routes')],
  ['/api/hoa-don', require('./routes/hoa_don_routes')],
  ['/api/thong-ke', require('./routes/thong_ke_routes')],
  ['/api/lich-xem', require('./routes/lich_xem_routes')],
  ['/api/bai-viet', require('./routes/bang_tin_routes')],
  ['/api/danh-gia-phong', require('./routes/danh_gia_routes')],
  ['/api/thong-bao', require('./routes/thong_bao_routes')],
];

// Hùng sở hữu điểm nối chung; nghiệp vụ bên trong các router này do thành viên 2/3 thực hiện.
// Router rỗng chưa được mount để backend vẫn chạy trong lúc các module đang phát triển.
const cacRouteThanhVien = [
  ['/api/day-tro', './routes/day_tro_routes', 'Thành viên 2'],
  ['/api/phong-tro', './routes/phong_tro_routes', 'Thành viên 2'],
  ['/api/hop-dong', './routes/hop_dong_routes', 'Thành viên 2'],
  ['/api/tin-dang', './routes/tin_dang_routes', 'Thành viên 2'],
  ['/api/tai-khoan', './routes/tai_khoan_routes', 'Thành viên 3'],
  ['/api/nguoi-thue', './routes/nguoi_thue_routes', 'Thành viên 3'],
  ['/api/yeu-cau-sua-chua', './routes/sua_chua_routes', 'Thành viên 3'],
  ['/api/ho-so-o-ghep', './routes/o_ghep_routes', 'Thành viên 3'],
  ['/api/upload', './routes/upload_routes', 'Thành viên 3'],
  ['/api', './routes/dang_nhap_routes', 'Thành viên 3'],
];

const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(cors(allowedOrigins.length
  ? { origin: allowedOrigins, credentials: true }
  : undefined));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/api/health', (req, res) => guiThanhCong(res, {
  message: 'Backend đang hoạt động.',
  data: { database: 'connected' },
}));

for (const [duongDan, router] of cacRouteHung) app.use(duongDan, router);

for (const [duongDan, tepRoute, thanhVien] of cacRouteThanhVien) {
  const router = require(tepRoute);
  if (typeof router !== 'function') {
    console.warn(`[API] Chưa mount ${duongDan}: ${tepRoute} chưa export Express Router (${thanhVien}).`);
    continue;
  }

  app.use(duongDan, router);
}

app.use((req, res) => guiThatBai(res, {
  statusCode: 404,
  message: `Không tìm thấy API ${req.method} ${req.originalUrl}.`,
}));

app.use(xuLyLoi);

async function khoiDongServer() {
  await ketNoiDatabase();
  const port = Number(process.env.PORT) || 5000;

  return app.listen(port, () => {
    console.log(`Backend đang chạy tại http://localhost:${port}/api`);
  });
}

if (require.main === module) {
  khoiDongServer().catch((error) => {
    console.error('Không thể khởi động backend:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, khoiDongServer };

// quyền truy cập ảnh tĩnh
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));