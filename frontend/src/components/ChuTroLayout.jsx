import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell, Building2, CalendarDays, ChevronDown, CircleHelp, FileText, Gauge, House,
  Menu, MessageSquareText, ReceiptText, Settings2, Star, Users, Wrench, X,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import api from '../services/api.js'

const groups = [
  {
    label: 'Không gian',
    links: [
      { to: '/thong-ke', label: 'Tổng quan', icon: Gauge },
      { to: '/day-tro', label: 'Dãy trọ', icon: Building2 },
      { to: '/phong-tro', label: 'Phòng trọ', icon: House },
      { to: '/nguoi-thue', label: 'Người thuê', icon: Users },
      { to: '/hop-dong', label: 'Hợp đồng', icon: FileText },
    ],
  },
  {
    label: 'Thu chi',
    links: [
      { to: '/dien-nuoc', label: 'Điện nước', icon: Gauge },
      { to: '/hoa-don', label: 'Hóa đơn', icon: ReceiptText },
      { to: '/dich-vu', label: 'Dịch vụ & đơn giá', icon: Settings2 },
    ],
  },
  {
    label: 'Kết nối',
    links: [
      { to: '/lich-xem', label: 'Lịch xem phòng', icon: CalendarDays },
      { to: '/sua-chua', label: 'Sửa chữa', icon: Wrench },
      { to: '/bang-tin', label: 'Bảng tin & sự kiện', icon: MessageSquareText },
      { to: '/danh-gia-phong', label: 'Đánh giá phòng', icon: Star },
    ],
  },
]

const titles = {
  '/thong-ke': 'Tổng quan', '/day-tro': 'Dãy trọ', '/phong-tro': 'Phòng trọ',
  '/nguoi-thue': 'Người thuê', '/hop-dong': 'Hợp đồng', '/dien-nuoc': 'Điện nước',
  '/hoa-don': 'Hóa đơn', '/dich-vu': 'Dịch vụ & đơn giá', '/lich-xem': 'Lịch xem phòng',
  '/sua-chua': 'Sửa chữa', '/bang-tin': 'Bảng tin & sự kiện',
  '/danh-gia-phong': 'Đánh giá phòng', '/thong-bao': 'Thông báo',
}

const roleLabels = { CHU_TRO: 'Chủ trọ', KHACH_THUE: 'Khách thuê', QUAN_TRI: 'Quản trị viên' }
const accountStatusLabels = { HOAT_DONG: 'Đang hoạt động', NGUNG_HOAT_DONG: 'Ngừng hoạt động', BI_KHOA: 'Đã khóa' }

function tenHienThi(user, authStatus) {
  if (user) return user.hoTen || user.ten || user.name || user.email || 'Tài khoản'
  if (authStatus === 'loading') return 'Đang tải tài khoản…'
  if (authStatus === 'unavailable') return 'Chưa đồng bộ tài khoản'
  return 'Chưa đăng nhập'
}

function chuCaiDaiDien(name) {
  return Array.from(String(name || '').trim())[0]?.toLocaleUpperCase('vi-VN') || '?'
}

function moTaTaiKhoan(user, authStatus) {
  if (!user) {
    if (authStatus === 'loading') return 'Đang đồng bộ hồ sơ'
    if (authStatus === 'unavailable') return 'Chưa kết nối API tài khoản'
    return 'Đăng nhập để đồng bộ hồ sơ'
  }

  const role = roleLabels[user.vaiTro] || user.vaiTro
  const status = accountStatusLabels[user.trangThai]
    || (user.trangThai ? String(user.trangThai).replaceAll('_', ' ').toLowerCase() : 'Đã đăng nhập')
  return [role, status].filter(Boolean).join(' · ')
}

function Navigation({ onNavigate }) {
  return (
    <nav className="side-nav" aria-label="Điều hướng chủ trọ">
      {groups.map((group) => (
        <div className="side-nav__group" key={group.label}>
          <div className="side-nav__label">{group.label}</div>
          {group.links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) => `side-nav__link${isActive ? ' is-active' : ''}`}
            >
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

export default function ChuTroLayout() {
  const location = useLocation()
  const { user, authStatus } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const pageTitle = titles[location.pathname] || 'Không gian chủ trọ'
  const accountName = tenHienThi(user, authStatus)
  const accountInitial = chuCaiDaiDien(user?.hoTen || user?.ten || user?.name || user?.email)
  const accountDescription = moTaTaiKhoan(user, authStatus)

  useEffect(() => {
    let active = true
    api.get('/thong-bao/chua-doc')
      .then((response) => {
        if (active) setUnread(response.data?.total || 0)
      })
      .catch(() => {
        if (active) setUnread(0)
      })
    return () => { active = false }
  }, [location.pathname])

  return (
    <div className="owner-app">
      {menuOpen && <button className="nav-scrim" aria-label="Đóng menu" onClick={() => setMenuOpen(false)} />}
      <aside className={`owner-sidebar${menuOpen ? ' is-open' : ''}`}>
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>Stay<span className="brand-lockup__accent">Sync</span></span>
          <button className="icon-button sidebar-close" aria-label="Đóng menu" onClick={() => setMenuOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switcher">
          <span className="workspace-switcher__icon"><Building2 size={17} /></span>
          <span className="workspace-switcher__text"><small>KHÔNG GIAN</small><b>Quản lý nhà trọ</b></span>
          <ChevronDown size={15} className="workspace-switcher__chevron" />
        </div>
        <Navigation onNavigate={() => setMenuOpen(false)} />
        <div className="sidebar-bottom">
          <div className="sidebar-help"><span className="sidebar-help__mark"><CircleHelp size={16} aria-hidden="true" /></span><span><b>Cần hỗ trợ?</b><small>Xem hướng dẫn sử dụng</small></span></div>
          <div className="account-row"><span className="account-avatar" aria-hidden="true">{accountInitial}</span><span><b title={accountName}>{accountName}</b><small title={accountDescription}>{accountDescription}</small></span><ChevronDown size={15} /></div>
        </div>
      </aside>
      <div className="owner-main">
        <header className="owner-topbar">
          <div className="owner-topbar__left">
            <button className="icon-button menu-toggle" aria-label="Mở menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
            <div className="breadcrumb"><span>StaySync</span><span className="breadcrumb__slash">/</span><b>{pageTitle}</b></div>
          </div>
          <div className="owner-topbar__right">
            <span className="today-label">Không gian chủ trọ</span>
            <NavLink to="/thong-bao" className="icon-button notification-button" aria-label={`Thông báo, ${unread} chưa đọc`}>
              <Bell size={19} />{unread > 0 && <span className="notification-dot">{unread > 9 ? '9+' : unread}</span>}
            </NavLink>
            <span className="topbar-divider" />
            <span className="account-avatar account-avatar--small" role="img" aria-label={`Avatar của ${accountName}`}>{accountInitial}</span>
          </div>
        </header>
        <main className="owner-content"><Outlet /></main>
      </div>
    </div>
  )
}
