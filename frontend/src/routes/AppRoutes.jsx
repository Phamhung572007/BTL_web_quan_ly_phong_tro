import { Navigate, Route, Routes } from 'react-router-dom'
import ChuTroLayout from '../components/ChuTroLayout.jsx'
import BangTin from '../pages/bang_tin/BangTin.jsx'
import DanhGiaPhong from '../pages/danh_gia_phong/DanhGiaPhong.jsx'
import DichVu from '../pages/dich_vu/DichVu.jsx'
import DienNuoc from '../pages/dien_nuoc/DienNuoc.jsx'
import HoaDon from '../pages/hoa_don/HoaDon.jsx'
import LichXem from '../pages/lich_xem/LichXem.jsx'
import ThongBao from '../pages/thong_bao/ThongBao.jsx'
import ThongKe from '../pages/thong_ke/ThongKe.jsx'

// Các trang thuộc Thành viên 2
import DayTro from '../pages/day_tro/DayTro.jsx'
import PhongTro from '../pages/phong_tro/PhongTro.jsx'
import HopDong from '../pages/hop_dong/HopDong.jsx'
import DangTin from '../pages/dang_tin/DangTin.jsx'

function ModuleChoTichHop({ tenModule, thanhVien }) {
  return (
    <section className="page-state page-state--empty">
      <div className="page-state__mark">{tenModule.slice(0, 1)}</div>
      <h1>{tenModule}</h1>
      <p>Trang này thuộc module của thành viên {thanhVien}; phần giao diện đang chờ tích hợp.</p>
    </section>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<ChuTroLayout />}>
        <Route index element={<Navigate to="/thong-ke" replace />} />
        <Route path="thong-ke" element={<ThongKe />} />
        <Route path="dich-vu" element={<DichVu />} />
        <Route path="dien-nuoc" element={<DienNuoc />} />
        <Route path="hoa-don" element={<HoaDon />} />
        <Route path="hoa-don/:id" element={<HoaDon />} />
        <Route path="lich-xem" element={<LichXem />} />
        <Route path="bang-tin" element={<BangTin />} />
        <Route path="danh-gia-phong" element={<DanhGiaPhong />} />
        <Route path="thong-bao" element={<ThongBao />} />

        {/* Các route của Thành viên 2 */}
        <Route path="day-tro" element={<DayTro />} />
        <Route path="phong-tro" element={<PhongTro />} />
        <Route path="hop-dong" element={<HopDong />} />
        <Route path="dang-tin" element={<DangTin />} />

        <Route path="nguoi-thue" element={<ModuleChoTichHop tenModule="Người thuê" thanhVien={3} />} />
        <Route path="sua-chua" element={<ModuleChoTichHop tenModule="Sửa chữa" thanhVien={3} />} />
        <Route path="*" element={<ModuleChoTichHop tenModule="Không tìm thấy trang" thanhVien="phụ trách" />} />
      </Route>
    </Routes>
  )
}