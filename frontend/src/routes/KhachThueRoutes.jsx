import { Routes, Route } from 'react-router-dom';
import KhachThueLayout from '../components/KhachThueLayout.jsx';
import KhachThueHome from '../pages/khach_thue/KhachThueHome.jsx';
import TimPhong from '../pages/tim_phong/TimPhong.jsx';
import SuaChua from '../pages/sua_chua/SuaChua.jsx';
import OGhep from '../pages/o_ghep/OGhep.jsx';
import TaiKhoan from '../pages/tai_khoan/TaiKhoan.jsx';
import { BaoVeRoute } from './BaoVeRoute.jsx';

function ModuleChoTichHop({ tenModule, thanhVien }) {
  return (
    <section className="page-state page-state--empty">
      <div className="page-state__mark">{tenModule.slice(0, 1)}</div>
      <h1>{tenModule}</h1>
      <p>Trang này thuộc module của thành viên {thanhVien}; phần giao diện đang chờ tích hợp.</p>
    </section>
  );
}

export default function KhachThueRoutes() {
  return (
    <BaoVeRoute vaiTroChoPhep={['KHACH_THUE']}>
      <Routes>
        <Route element={<KhachThueLayout />}>
          {/* Trang tổng quan khách thuê (TV3) */}
          <Route index element={<KhachThueHome />} />

          {/* Các route của Thành viên 3 */}
          <Route path="tim-phong" element={<TimPhong />} />
          <Route path="o-ghep" element={<OGhep />} />
          <Route path="sua-chua" element={<SuaChua />} />
          <Route path="tai-khoan" element={<TaiKhoan />} />

          {/* Thêm khi làm từng trang, đường dẫn bỏ phần /khach-thue */}
          <Route path="hop-dong" element={<ModuleChoTichHop tenModule="Hợp đồng của tôi" thanhVien={2} />} />
          <Route path="hoa-don" element={<ModuleChoTichHop tenModule="Hóa đơn của tôi" thanhVien={1} />} />
          <Route path="lich-xem" element={<ModuleChoTichHop tenModule="Lịch xem phòng" thanhVien={1} />} />
          <Route path="bang-tin" element={<ModuleChoTichHop tenModule="Bảng tin & sự kiện" thanhVien={1} />} />
          <Route path="danh-gia-phong" element={<ModuleChoTichHop tenModule="Đánh giá phòng" thanhVien={1} />} />
          <Route path="thong-bao" element={<ModuleChoTichHop tenModule="Thông báo" thanhVien={1} />} />
        </Route>
      </Routes>
    </BaoVeRoute>
  );
}