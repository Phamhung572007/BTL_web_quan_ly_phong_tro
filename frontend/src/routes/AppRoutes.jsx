import { Link, Navigate, Route, Routes } from 'react-router-dom'
import ChuTroLayout from '../components/ChuTroLayout.jsx'
import { EmptyState, PageHeader } from '../components/WorkspaceUI.jsx'

// Các màn thuộc Thành viên 2.
import DayTro from '../pages/day_tro/DayTro.jsx'
import PhongTro from '../pages/phong_tro/PhongTro.jsx'
import HopDong from '../pages/hop_dong/HopDong.jsx'
import DangTin from '../pages/dang_tin/DangTin.jsx'

function NotFound() {
  return (
    <section className="page">
      <PageHeader title="Không tìm thấy trang" description="Địa chỉ này không thuộc khu vực quản lý nhà trọ." />
      <section className="panel module-placeholder">
        <EmptyState
          title="Trang không tồn tại"
          detail="Kiểm tra lại đường dẫn hoặc trở về trang dãy trọ."
          action={<Link className="button button--primary" to="/day-tro">Về dãy trọ</Link>}
        />
      </section>
    </section>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Giữ đường dẫn để ghép giao diện thành viên 3 sau này. */}
      <Route path="dang-nhap" element={null} />

      <Route element={<ChuTroLayout />}>
        <Route index element={<Navigate to="/day-tro" replace />} />

        {/* Thành viên 2 */}
        <Route path="day-tro" element={<DayTro />} />
        <Route path="phong-tro" element={<PhongTro />} />
        <Route path="quan-ly-phong" element={<Navigate to="/phong-tro" replace />} />
        <Route path="hop-dong" element={<HopDong />} />
        <Route path="tin-dang" element={<DangTin />} />

        {/* Để sẵn URL cho các thành viên khác tích hợp màn hình sau. */}
        <Route path="thong-ke" element={null} />
        <Route path="dich-vu" element={null} />
        <Route path="dien-nuoc" element={null} />
        <Route path="hoa-don" element={null} />
        <Route path="hoa-don/:id" element={null} />
        <Route path="lich-xem" element={null} />
        <Route path="bang-tin" element={null} />
        <Route path="danh-gia-phong" element={null} />
        <Route path="thong-bao" element={null} />
        <Route path="nguoi-thue" element={null} />
        <Route path="sua-chua" element={null} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
