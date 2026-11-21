import { useEffect, useState } from "react";
import { THONG_BAO_MAU } from "../constants/thongBao_chuong";

// trả về số thông báo chưa xử lý 
export function useThongBao_chuong() {
  const [soMoi, setSoMoi] = useState(0);

  useEffect(() => {
    // hiện tại lấy từ dữ liệu mẫu.
    // khi có backend, thay bằng fetch("/api/thong-bao/chua-doc") rồi setSoMoi(data.soLuong).
    setSoMoi(THONG_BAO_MAU.filter((tb) => !tb.daXuLy).length);
  }, []);

  return { soMoi };
}