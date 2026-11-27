import { Routes, Route } from "react-router-dom";
//import KhachThueHome from "../pages/khach_thue/KhachThueHome";
import TimPhong from "../pages/tim_phong/TimPhong.jsx";
import SuaChua from "../pages/sua_chua/SuaChua.jsx";
import OGhep from "../pages/o_ghep/OGhep.jsx";
import TaiKhoan from "../pages/tai_khoan/TaiKhoan.jsx";
import { BaoVeRoute } from "./BaoVeRoute.jsx";

export default function KhachThueRoutes() {
  return (
    <Routes>
      <Route index element={<div>Trang chủ khách thuê (Đang chờ tích hợp)</div>} />
      {/* Thêm khi làm từng trang, đường dẫn bỏ phần /khach-thue */}
      {/* <Route path="hop-dong" element={<HopDongPhong />} /> */}
      {/* <Route path="hoa-don" element={<DanhSachHoaDon />} /> */}
      {/* <Route path="thong-bao" element={<ThongBao />} /> */}
      {/* <Route path="sua-chua" element={<GuiYeuCauSuaChua />} /> */}

      {/* Các route của Thành viên 3 */}
      <Route
        path="tim-phong"
        element={
          <BaoVeRoute vaiTroChoPhep={["KHACH_THUE"]}>
            <TimPhong />
          </BaoVeRoute>
        }
      />
      <Route
        path="o-ghep"
        element={
          <BaoVeRoute vaiTroChoPhep={["KHACH_THUE"]}>
            <OGhep />
          </BaoVeRoute>
        }
      />
      <Route
        path="sua-chua"
        element={
          <BaoVeRoute vaiTroChoPhep={["KHACH_THUE"]}>
            <SuaChua />
          </BaoVeRoute>
        }
      />
      <Route
        path="tai-khoan"
        element={
          <BaoVeRoute vaiTroChoPhep={["KHACH_THUE"]}>
            <TaiKhoan />
          </BaoVeRoute>
        }
      />
    </Routes>
  );
}