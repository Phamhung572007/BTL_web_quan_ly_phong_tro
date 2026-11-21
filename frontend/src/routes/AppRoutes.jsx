import { Routes, Route } from "react-router-dom";
import TrangChu from "../pages/trang_chu/TrangChu";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TrangChu />} />
    </Routes>
  );
}