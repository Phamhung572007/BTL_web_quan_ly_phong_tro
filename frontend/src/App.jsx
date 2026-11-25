import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.js';
import KhachThueRoutes from './routes/KhachThueRoutes.js';
import { BaoVeRoute } from './routes/BaoVeRoute.jsx';
import DangNhap from './pages/dang_nhap/DangNhap.jsx';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Trang Đăng nhập / Đăng ký công khai */}
          <Route path="/dang-nhap" element={<DangNhap />} />

          {/* 2. Luồng Khách thuê (/khach-thue/...) */}
          <Route path="/khach-thue/*" element={<KhachThueRoutes />} />

          {/* 3. Luồng Quản trị Chủ trọ (giữ nguyên toàn bộ route gốc của TV1 & TV2) */}
          <Route
            path="/*"
            element={
              <BaoVeRoute vaiTroChoPhep={['CHU_TRO', 'ADMIN']}>
                <AppRoutes />
              </BaoVeRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}