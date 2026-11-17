import {House,LayoutGrid,FileSignature,Zap,ReceiptText,Bell,BarChart3,Settings,} from "lucide-react";

export const NAV_ITEMS = [
  { path: "/", label: "Trang chủ", icon: House },
  { path: "/quan-ly-phong", label: "Quản lý phòng", icon: LayoutGrid },
  { path: "/hop-dong", label: "Hợp đồng", icon: FileSignature },
  { path: "/dien-nuoc", label: "Điện nước", icon: Zap },
  { path: "/hoa-don", label: "Hóa đơn", icon: ReceiptText },
  { path: "/thong-bao", label: "Thông báo", icon: Bell },
  { path: "/thong-ke", label: "Thống kê", icon: BarChart3 },
  { path: "/cai-dat", label: "Cài đặt", icon: Settings },
];