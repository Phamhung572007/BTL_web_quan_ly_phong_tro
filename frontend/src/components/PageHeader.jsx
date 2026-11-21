import { Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getNavItem } from "../constants/navigation";
import { useThongBao_chuong } from "../hooks/useThongBao_chuong";
import "./PageHeader.css";

export default function PageHeader() {
  const { pathname } = useLocation();
  const { soMoi } = useThongBao_chuong();

  // trang chi tiết (ví dụ /quan-ly-phong/102) tự có tiêu đề riêng
  const doanPath = pathname.split("/").filter(Boolean);
  if (doanPath.length > 1) return null;

  const item = getNavItem(pathname);

  return (
    <section className="page-header">
      <div>
        <h1 className="page-header-title">{item.title}</h1>
        {item.subtitle && <p className="page-header-subtitle">{item.subtitle}</p>}
      </div>

      <div className="page-header-actions">
        {item.notify && (
          <button className="page-header-bell" aria-label="Thông báo">
            <Bell size={24} strokeWidth={1.75} />
            {soMoi > 0 && <span className="page-header-dot" />}
          </button>
        )}
      </div>
    </section>
  );
}