import { Routes, Route } from "react-router-dom";
import KhachThueHome from "../pages/khach_thue/KhachThueHome";

export default function KhachThueRoutes() {
  return (
    <Routes>
      <Route index element={<KhachThueHome />} />
      {/* Thêm khi làm từng trang, đường dẫn bỏ phần /khach-thue */}
      {/* <Route path="hop-dong" element={<HopDongPhong />} /> */}
      {/* <Route path="hoa-don" element={<DanhSachHoaDon />} /> */}
      {/* <Route path="thong-bao" element={<ThongBao />} /> */}
      {/* <Route path="sua-chua" element={<GuiYeuCauSuaChua />} /> */}
    </Routes>
  );
}