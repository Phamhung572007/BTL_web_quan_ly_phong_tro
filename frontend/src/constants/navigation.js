import {
  House,
  LayoutGrid,
  FileSignature,
  Zap,
  ReceiptText,
  Bell,
  BarChart3,
  Settings,
} from "lucide-react";

// path: đường dẫn | label: tên trên sidebar | title: tiêu đề trên header
// subtitle: mô tả dưới tiêu đề (tùy chọn) | notify: có hiện chuông không
export const NAV_ITEMS = [
  { path: "/", label: "Trang chủ", icon: House, title: "Trang chủ", notify: true },
  {
    path: "/quan-ly-phong",
    label: "Quản lý phòng",
    icon: LayoutGrid,
    title: "Quản lý phòng & Dãy trọ",
    notify: true
  },
  {
    path: "/hop-dong",
    label: "Hợp đồng",
    icon: FileSignature,
    title: "Hợp đồng thuê phòng",
    notify: true
  },
  { path: "/dien-nuoc", label: "Điện nước", icon: Zap, title: "Nhập chỉ số điện nước", notify: true },
  { path: "/hoa-don", label: "Hóa đơn", icon: ReceiptText, title: "Hóa đơn",notify: true },
  { path: "/thong-bao", label: "Thông báo", icon: Bell, title: "Thông báo", notify: true },
  { path: "/thong-ke", label: "Thống kê", icon: BarChart3, title: "Thống kê",notify: true },
  { path: "/cai-dat", label: "Cài đặt", icon: Settings, title: "Cài đặt",notify: true },
];

// tìm mục menu khớp với đường dẫn hiện tại
// "/quan-ly-phong/102" khớp với "/quan-ly-phong".
export function getNavItem(pathname) {
  return (
    NAV_ITEMS.filter(
      (item) =>
        pathname === item.path ||
        (item.path !== "/" && pathname.startsWith(item.path + "/"))
    ).sort((a, b) => b.path.length - a.path.length)[0] ?? NAV_ITEMS[0]
  );
}