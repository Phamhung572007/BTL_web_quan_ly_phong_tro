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
import NguoiThue from '../pages/nguoi_thue/NguoiThue.jsx'
import SuaChua from '../pages/sua_chua/SuaChua.jsx'
import TaiKhoan from '../pages/tai_khoan/TaiKhoan.jsx'

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
        <Route path="day-tro" element={<ModuleChoTichHop tenModule="Dãy trọ" thanhVien={2} />} />
        <Route path="phong-tro" element={<ModuleChoTichHop tenModule="Phòng trọ" thanhVien={2} />} />
        <Route path="hop-dong" element={<ModuleChoTichHop tenModule="Hợp đồng" thanhVien={2} />} />


        //TV3 CẬP NHẬT ROUTE
        <Route path="nguoi-thue" element={<NguoiThue />} />
        <Route path="sua-chua" element={<SuaChua />} />
        <Route path="tai-khoan" element={<TaiKhoan />} />
        <Route path="*" element={<ModuleChoTichHop tenModule="Không tìm thấy trang" thanhVien="phụ trách" />} />
      </Route>
    </Routes>
  )
}
